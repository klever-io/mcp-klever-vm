// Tool definition for MCP - Check SDK status
export const checkSdkStatusToolDefinition = {
  name: 'check_sdk_status',
  description:
    'Check the installation status of the Klever SDK (ksc, koperator, VM libraries, wallet key)',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

// Tool definition for MCP - Install Klever SDK
export const installKleverSdkToolDefinition = {
  name: 'install_klever_sdk',
  description:
    'Install or update the Klever SDK tools (ksc, koperator, or both) with required VM dependencies',
  inputSchema: {
    type: 'object',
    properties: {
      tool: {
        type: 'string',
        enum: ['ksc', 'koperator', 'all'],
        description: 'Which tool to install (default: all)',
        default: 'all',
      },
    },
  },
};

export const createCheckSdkScript = (): string => {
  return `#!/bin/bash
# Klever SDK Status Check
# Outputs JSON with the status of each SDK component

set -e

SDK_PATH="\${KLEVER_SDK_PATH:-$HOME/klever-sdk}"

# JSON escape function
json_escape() {
  local s="$1"
  s="\${s//\\\\/\\\\\\\\}"
  s="\${s//\\"/\\\\\\\"}"
  printf '%s' "$s"
}

# Detect platform
get_platform() {
  local os_type=$(uname -s)
  local arch=$(uname -m)
  case "$os_type" in
    "Darwin")
      case "$arch" in
        "arm64") echo "darwin-arm64" ;;
        "x86_64") echo "darwin-amd64" ;;
        *) echo "darwin-amd64" ;;
      esac
      ;;
    "Linux")
      case "$arch" in
        "x86_64") echo "linux-amd64" ;;
        "i386"|"i686") echo "linux-386" ;;
        "arm64"|"aarch64") echo "linux-arm64" ;;
        *) echo "linux-amd64" ;;
      esac
      ;;
    "MINGW"*|"CYGWIN"*|"MSYS"*)
      case "$arch" in
        "x86_64") echo "windows-amd64" ;;
        *) echo "windows-386" ;;
      esac
      ;;
    *) echo "unknown" ;;
  esac
}

PLATFORM=$(get_platform)

# Check if SDK directory exists
SDK_EXISTS="false"
if [ -d "$SDK_PATH" ]; then
  SDK_EXISTS="true"
fi

# Check ksc
KSC_INSTALLED="false"
KSC_VERSION=""
KSC_PATH=""
KSC_BIN="$SDK_PATH/ksc"
if [[ "$PLATFORM" == windows-* ]] && [ -x "$SDK_PATH/ksc.exe" ]; then
  KSC_BIN="$SDK_PATH/ksc.exe"
fi
if [ -x "$KSC_BIN" ]; then
  KSC_INSTALLED="true"
  KSC_PATH="$KSC_BIN"
  KSC_VERSION=$("$KSC_BIN" --version 2>/dev/null | grep -oE '[0-9]+\\.[0-9]+\\.[0-9]+' | head -n1 || echo "")
fi

# Check koperator
KOPERATOR_INSTALLED="false"
KOPERATOR_VERSION=""
KOPERATOR_PATH=""
KOPERATOR_BIN="$SDK_PATH/koperator"
if [[ "$PLATFORM" == windows-* ]] && [ -x "$SDK_PATH/koperator.exe" ]; then
  KOPERATOR_BIN="$SDK_PATH/koperator.exe"
fi
if [ -x "$KOPERATOR_BIN" ]; then
  KOPERATOR_INSTALLED="true"
  KOPERATOR_PATH="$KOPERATOR_BIN"
  KOPERATOR_VERSION=$("$KOPERATOR_BIN" --version 2>/dev/null | grep -oE '[0-9]+\\.[0-9]+\\.[0-9]+' | head -n1 || echo "")
fi

# Check VM library
VM_INSTALLED="false"
VM_FILE=""
case "$PLATFORM" in
  "darwin-arm64")
    if [ -f "$SDK_PATH/libvmexeccapi_arm.dylib" ]; then
      VM_INSTALLED="true"
      VM_FILE="libvmexeccapi_arm.dylib"
    fi
    ;;
  "darwin"|"darwin-amd64")
    if [ -f "$SDK_PATH/libvmexeccapi.dylib" ]; then
      VM_INSTALLED="true"
      VM_FILE="libvmexeccapi.dylib"
    fi
    ;;
  "linux"*)
    if [ -f "$SDK_PATH/libvmexeccapi.so" ]; then
      VM_INSTALLED="true"
      VM_FILE="libvmexeccapi.so"
    fi
    ;;
esac

# Check wallet key
WALLET_EXISTS="false"
WALLET_PATH=""
if [ -f "$SDK_PATH/walletKey.pem" ]; then
  WALLET_EXISTS="true"
  WALLET_PATH="$SDK_PATH/walletKey.pem"
fi

# Output JSON
cat <<EOF
{
  "sdkPath": "$(json_escape "$SDK_PATH")",
  "sdkExists": $SDK_EXISTS,
  "ksc": {
    "installed": $KSC_INSTALLED,
    "version": "$(json_escape "$KSC_VERSION")",
    "path": "$(json_escape "$KSC_PATH")"
  },
  "koperator": {
    "installed": $KOPERATOR_INSTALLED,
    "version": "$(json_escape "$KOPERATOR_VERSION")",
    "path": "$(json_escape "$KOPERATOR_PATH")"
  },
  "vmLibrary": {
    "installed": $VM_INSTALLED,
    "file": "$(json_escape "$VM_FILE")"
  },
  "walletKey": {
    "exists": $WALLET_EXISTS,
    "path": "$(json_escape "$WALLET_PATH")"
  },
  "platform": "$(json_escape "$PLATFORM")"
}
EOF
`;
};

export const createInstallSdkScript = (tool: string): string => {
  return `#!/bin/bash
# Klever SDK Installer
# Installs: ${tool === 'all' ? 'ksc + koperator + VM dependencies' : tool === 'koperator' ? 'koperator + VM dependencies' : 'ksc'}

set -e

DEFAULT_KSC_VERSION="0.45.0"
DEFAULT_KOPERATOR_VERSION="1.7.11"
LATEST_VERSIONS_URL="https://storage.googleapis.com/kleverchain-public/versions.json"
BASE_STORAGE_URL="https://storage.googleapis.com/kleverchain-public"
SDK_PATH="\${KLEVER_SDK_PATH:-$HOME/klever-sdk}"
TOOL_TO_INSTALL="${tool}"

# JSON escape function
json_escape() {
  local s="$1"
  s="\${s//\\\\/\\\\\\\\}"
  s="\${s//\\"/\\\\\\\"}"
  printf '%s' "$s"
}

# Detect platform
get_platform() {
  local os_type=$(uname -s)
  local arch=$(uname -m)
  case "$os_type" in
    "Darwin")
      case "$arch" in
        "arm64") echo "darwin-arm64" ;;
        "x86_64") echo "darwin-amd64" ;;
        *) echo "darwin-amd64" ;;
      esac
      ;;
    "Linux")
      case "$arch" in
        "x86_64") echo "linux-amd64" ;;
        "i386"|"i686") echo "linux-386" ;;
        "arm64"|"aarch64") echo "linux-arm64" ;;
        *) echo "linux-amd64" ;;
      esac
      ;;
    "MINGW"*|"CYGWIN"*|"MSYS"*)
      case "$arch" in
        "x86_64") echo "windows-amd64" ;;
        *) echo "windows-386" ;;
      esac
      ;;
    *)
      echo "INSTALL_ERROR: Unsupported operating system: $os_type" >&2
      exit 1
      ;;
  esac
}

get_exe_extension() {
  case "$(uname -s)" in
    "MINGW"*|"CYGWIN"*|"MSYS"*) echo ".exe" ;;
    *) echo "" ;;
  esac
}

PLATFORM=$(get_platform)
EXE_EXT=$(get_exe_extension)

# Get latest version info from CDN
get_version_info() {
  local tool_name="$1"
  local fallback_version="$2"
  local temp_file
  temp_file=$(mktemp)

  if curl -sSf -L -o "$temp_file" "$LATEST_VERSIONS_URL" 2>/dev/null || wget -q -O "$temp_file" "$LATEST_VERSIONS_URL" 2>/dev/null; then
    local version=""
    local dependencies=""

    if command -v jq >/dev/null 2>&1; then
      version=$(jq -r ".\\"$PLATFORM\\".\\"$tool_name\\".version // .\\"$tool_name\\" // \\"$fallback_version\\"" "$temp_file" 2>/dev/null)
      dependencies=$(jq -r "if .\\"$PLATFORM\\".\\"$tool_name\\".dependencies then .\\"$PLATFORM\\".\\"$tool_name\\".dependencies | join(\\" \\") else \\"\\" end" "$temp_file" 2>/dev/null)
    else
      version="$fallback_version"
      dependencies=""
      if [ "$tool_name" = "koperator" ]; then
        case "$PLATFORM" in
          "darwin-arm64") dependencies="libvmexeccapi_arm.dylib" ;;
          "darwin"|"darwin-amd64") dependencies="libvmexeccapi.dylib" ;;
          "linux"*) dependencies="libvmexeccapi.so" ;;
        esac
      fi
    fi

    rm -f "$temp_file"
    echo "$version|$dependencies"
  else
    rm -f "$temp_file"
    local dependencies=""
    if [ "$tool_name" = "koperator" ]; then
      case "$PLATFORM" in
        "darwin-arm64") dependencies="libvmexeccapi_arm.dylib" ;;
        "darwin"|"darwin-amd64") dependencies="libvmexeccapi.dylib" ;;
        "linux"*) dependencies="libvmexeccapi.so" ;;
      esac
    fi
    echo "$fallback_version|$dependencies"
  fi
}

# Install a single tool
install_one_tool() {
  local tool_name="$1"
  local fallback_version="$2"

  local version_info
  version_info=$(get_version_info "$tool_name" "$fallback_version")
  local version=$(echo "$version_info" | cut -d'|' -f1)
  local dependencies=$(echo "$version_info" | cut -d'|' -f2)
  local tool_path="\${SDK_PATH}/\${tool_name}\${EXE_EXT}"

  # Check if already installed with same version
  if [ -x "$tool_path" ]; then
    local installed_version
    installed_version=$("$tool_path" --version 2>/dev/null | grep -oE '[0-9]+\\.[0-9]+\\.[0-9]+' | head -n1 || echo "")
    if [ "$installed_version" = "$version" ]; then
      echo "SKIP|$tool_name|$installed_version|already up to date"
      return 0
    fi
  fi

  mkdir -p "$SDK_PATH"

  local v_version="$version"
  if [[ ! "$version" =~ ^v ]]; then
    v_version="v$version"
  fi

  local download_url="\${BASE_STORAGE_URL}/\${tool_name}/\${PLATFORM}/\${v_version}/\${tool_name}\${EXE_EXT}"
  local temp_path="\${SDK_PATH}/\${tool_name}_temp"

  if ! curl -fSL -o "$temp_path" "$download_url" 2>/dev/null && ! wget -O "$temp_path" "$download_url" 2>/dev/null; then
    echo "FAIL|$tool_name||download failed from $download_url"
    rm -f "$temp_path"
    return 1
  fi

  # Download dependencies
  if [ -n "$dependencies" ]; then
    for dep in $dependencies; do
      local dep_url="\${BASE_STORAGE_URL}/\${tool_name}/\${PLATFORM}/\${v_version}/$dep"
      local dep_path="\${SDK_PATH}/$dep"
      if ! curl -fSL -o "$dep_path" "$dep_url" 2>/dev/null && ! wget -O "$dep_path" "$dep_url" 2>/dev/null; then
        echo "FAIL|$tool_name||dependency download failed: $dep"
        rm -f "$temp_path"
        return 1
      fi
      chmod +x "$dep_path"
    done
  fi

  chmod +x "$temp_path"
  mv "$temp_path" "$tool_path"

  local new_version
  new_version=$("$tool_path" --version 2>/dev/null | grep -oE '[0-9]+\\.[0-9]+\\.[0-9]+' | head -n1 || echo "")
  if [ -n "$new_version" ]; then
    echo "OK|$tool_name|$new_version|installed successfully"
  else
    echo "OK|$tool_name|$version|installed (version check unavailable)"
  fi
}

# Run installation (disable errexit so failures are captured in results)
RESULTS=""
set +e

if [ "$TOOL_TO_INSTALL" = "all" ] || [ "$TOOL_TO_INSTALL" = "ksc" ]; then
  KSC_RESULT=$(install_one_tool "ksc" "$DEFAULT_KSC_VERSION")
  if [ $? -ne 0 ] && [ -z "$KSC_RESULT" ]; then
    KSC_RESULT="FAIL|ksc||unexpected error during installation"
  fi
  RESULTS="$KSC_RESULT"
fi

if [ "$TOOL_TO_INSTALL" = "all" ] || [ "$TOOL_TO_INSTALL" = "koperator" ]; then
  KOPERATOR_RESULT=$(install_one_tool "koperator" "$DEFAULT_KOPERATOR_VERSION")
  if [ $? -ne 0 ] && [ -z "$KOPERATOR_RESULT" ]; then
    KOPERATOR_RESULT="FAIL|koperator||unexpected error during installation"
  fi
  if [ -n "$RESULTS" ]; then
    RESULTS="$RESULTS
$KOPERATOR_RESULT"
  else
    RESULTS="$KOPERATOR_RESULT"
  fi
fi

set -e

# Build JSON output
echo "{"
echo "  \\"platform\\": \\"$(json_escape "$PLATFORM")\\","
echo "  \\"sdkPath\\": \\"$(json_escape "$SDK_PATH")\\","
echo "  \\"results\\": ["

FIRST="true"
while IFS= read -r line; do
  STATUS=$(echo "$line" | cut -d'|' -f1)
  TOOL=$(echo "$line" | cut -d'|' -f2)
  VER=$(echo "$line" | cut -d'|' -f3)
  MSG=$(echo "$line" | cut -d'|' -f4)

  if [ "$FIRST" = "true" ]; then
    FIRST="false"
  else
    echo ","
  fi

  SUCCESS="true"
  if [ "$STATUS" = "FAIL" ]; then
    SUCCESS="false"
  fi

  SKIPPED="false"
  if [ "$STATUS" = "SKIP" ]; then
    SKIPPED="true"
  fi

  printf '    { "tool": "%s", "success": %s, "skipped": %s, "version": "%s", "message": "%s" }' "$(json_escape "$TOOL")" "$SUCCESS" "$SKIPPED" "$(json_escape "$VER")" "$(json_escape "$MSG")"
done <<< "$RESULTS"

echo ""
echo "  ]"
echo "}"
`;
};
