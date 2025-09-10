#!/bin/bash

# Klever SDK Installation Script
#
# This script installs the Klever SDK tools (ksc and koperator).
#
# Usage:
#   ./scripts/install-sdk.sh
#   chmod +x scripts/install-sdk.sh && ./scripts/install-sdk.sh

set -e  # Exit on any error

# Configuration
DEFAULT_KSC_VERSION="0.45.0"
DEFAULT_KOPERATOR_VERSION="1.7.11"
LATEST_VERSIONS_URL="https://storage.googleapis.com/kleverchain-public/versions.json"
BASE_STORAGE_URL="https://storage.googleapis.com/kleverchain-public"

# SDK installation path - defaults to ~/.klever-sdk
SDK_PATH="${KLEVER_SDK_PATH:-$HOME/klever-sdk}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✅${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}❌${NC} $1" >&2
}

# Get the current platform string compatible with Klever's storage structure
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
            log_error "Unsupported operating system: $os_type"
            exit 1
            ;;
    esac
}

# Get the executable extension for the current platform
get_exe_extension() {
    case "$(uname -s)" in
        "MINGW"*|"CYGWIN"*|"MSYS"*) echo ".exe" ;;
        *) echo "" ;;
    esac
}

# Download a file from URL to local path
download_file() {
    local url="$1"
    local output_path="$2"

    log_info "Downloading $(basename "$url")..."

    if command -v curl >/dev/null 2>&1; then
        curl -L -o "$output_path" "$url"
    elif command -v wget >/dev/null 2>&1; then
        wget -O "$output_path" "$url"
    else
        log_error "Neither curl nor wget is available. Please install one of them."
        exit 1
    fi
}

# Get the latest version and dependencies for a tool (uses jq if available, otherwise fallback)
get_latest_version_info() {
    local tool_name="$1"
    local fallback_version="$2"
    local platform="$3"

    local temp_file=$(mktemp)

    # Download versions file silently
    if curl -s -L -o "$temp_file" "$LATEST_VERSIONS_URL" 2>/dev/null || wget -q -O "$temp_file" "$LATEST_VERSIONS_URL" 2>/dev/null; then
        # Try to parse JSON (requires jq or python)
        local version=""
        local dependencies=""

        if command -v jq >/dev/null 2>&1; then
            # Try platform-specific version first
            version=$(jq -r ".\"$platform\".\"$tool_name\".version // .\"$tool_name\" // \"$fallback_version\"" "$temp_file" 2>/dev/null)
            dependencies=$(jq -r "if .\"$platform\".\"$tool_name\".dependencies then .\"$platform\".\"$tool_name\".dependencies | join(\" \") else \"\" end" "$temp_file" 2>/dev/null)
        else
            version="$fallback_version"
            dependencies=""

            # Known dependencies for specific platforms
            if [ "$tool_name" = "koperator" ]; then
                case "$platform" in
                    "darwin-arm64") dependencies="libvmexeccapi_arm.dylib" ;;
                    "darwin"|"darwin-amd64") dependencies="libvmexeccapi.dylib" ;;
                    "linux") dependencies="libvmexeccapi.so" ;;
                esac
            fi
        fi

        rm -f "$temp_file"
        echo "$version|$dependencies"
    else
        rm -f "$temp_file"

        # Fallback without API: use hardcoded versions and known dependencies
        local dependencies=""
        if [ "$tool_name" = "koperator" ]; then
            case "$platform" in
                "darwin-arm64") dependencies="libvmexeccapi_arm.dylib" ;;
                "darwin"|"darwin-amd64") dependencies="libvmexeccapi.dylib" ;;
                "linux") dependencies="libvmexeccapi.so" ;;
            esac
        fi

        echo "$fallback_version|$dependencies"
    fi
}

# Build download URL for a tool
get_download_url() {
    local tool_name="$1"
    local version="$2"
    local platform="$3"
    local exe_ext="$4"

    local v_version="$version"
    if [[ ! "$version" =~ ^v ]]; then
        v_version="v$version"
    fi

    echo "${BASE_STORAGE_URL}/${tool_name}/${platform}/${v_version}/${tool_name}${exe_ext}"
}

# Get the target installation path for a tool
get_tool_path() {
    local tool_name="$1"
    local exe_ext="$2"

    echo "${SDK_PATH}/${tool_name}${exe_ext}"
}

# Check if a tool is already installed and get its version
check_installed() {
    local tool_path="$1"

    if [ -x "$tool_path" ]; then
        local output
        if output=$("$tool_path" --version 2>/dev/null); then
            echo "$output" | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -n1
        fi
    fi
}

# Compare two version strings
version_compare() {
    local version1="$1"
    local version2="$2"

    if [ "$version1" = "$version2" ]; then
        return 0  # Equal
    fi

    # Split versions and compare
    local IFS='.'
    local i ver1=($version1) ver2=($version2)

    # Fill empty fields with zeros
    for ((i=${#ver1[@]}; i<${#ver2[@]}; i++)); do
        ver1[i]=0
    done
    for ((i=${#ver2[@]}; i<${#ver1[@]}; i++)); do
        ver2[i]=0
    done

    # Compare each part
    for ((i=0; i<${#ver1[@]}; i++)); do
        if [[ ${ver1[i]} -gt ${ver2[i]} ]]; then
            return 1  # version1 > version2
        elif [[ ${ver1[i]} -lt ${ver2[i]} ]]; then
            return 2  # version1 < version2
        fi
    done

    return 0  # Equal
}

# Install a specific tool
install_tool() {
    local tool_name="$1"
    local fallback_version="$2"

    echo
    log_info "Installing $tool_name..."

    local platform=$(get_platform)
    local exe_ext=$(get_exe_extension)

    # Get latest version and dependencies
    local version_info=$(get_latest_version_info "$tool_name" "$fallback_version" "$platform")
    local version=$(echo "$version_info" | cut -d'|' -f1)
    local dependencies=$(echo "$version_info" | cut -d'|' -f2)

    log_info "Target version: $version"
    if [ -n "$dependencies" ]; then
        log_info "Dependencies: $dependencies"
    fi

    # Check if already installed
    local tool_path=$(get_tool_path "$tool_name" "$exe_ext")
    local installed_version=$(check_installed "$tool_path")

    if [ -n "$installed_version" ]; then
        version_compare "$installed_version" "$version"
        local cmp_result=$?

        if [ $cmp_result -eq 0 ] || [ $cmp_result -eq 1 ]; then
            log_success "$tool_name $installed_version is already installed and up to date"
            return 0
        else
            log_info "Upgrading $tool_name from $installed_version to $version"
        fi
    else
        log_info "Installing $tool_name $version"
    fi

    # Create SDK directory
    mkdir -p "$SDK_PATH"

    local download_url=$(get_download_url "$tool_name" "$version" "$platform" "$exe_ext")
    local temp_path="${SDK_PATH}/${tool_name}_temp"

    # Download the tool
    if ! download_file "$download_url" "$temp_path"; then
        log_error "Failed to download $tool_name from $download_url"
        rm -f "$temp_path"
        return 1
    fi

    # Download dependencies
    if [ -n "$dependencies" ]; then
        for dep in $dependencies; do
            log_info "Installing dependency: $dep"
            local dep_url=$(get_download_url "$tool_name" "$version" "$platform" "")
            dep_url="${dep_url%/*}/$dep"
            local dep_path="${SDK_PATH}/$dep"

            if ! download_file "$dep_url" "$dep_path"; then
                log_error "Failed to download dependency $dep"
                rm -f "$temp_path"
                return 1
            fi

            # Make dependency executable if it's a binary
            chmod +x "$dep_path"
        done
    fi

    # Make executable
    chmod +x "$temp_path"

    # Move to final location
    mv "$temp_path" "$tool_path"

    # Verify installation
    local new_version=$(check_installed "$tool_path")
    if [ -n "$new_version" ]; then
        log_success "$tool_name $new_version installed successfully"
    else
        log_error "Installation verification failed for $tool_name"
        return 1
    fi
}

# Main installation function
main() {
    echo "🚀 Klever SDK Installation"
    echo "=========================="
    echo "Platform: $(get_platform)"
    echo "SDK Path: $SDK_PATH"

    # Check required tools
    if ! command -v curl >/dev/null 2>&1 && ! command -v wget >/dev/null 2>&1; then
        log_error "Neither curl nor wget is available. Please install one of them."
        exit 1
    fi

    # Install tools
    if ! install_tool "ksc" "$DEFAULT_KSC_VERSION"; then
        log_error "Failed to install ksc"
        exit 1
    fi

    if ! install_tool "koperator" "$DEFAULT_KOPERATOR_VERSION"; then
        log_error "Failed to install koperator"
        exit 1
    fi

    echo
    log_success "Installation completed successfully!"
    echo
    echo "Add the following to your shell profile (.bashrc, .zshrc, etc.):"
    echo "export PATH=\"$SDK_PATH:\$PATH\""
    echo
    echo "Or run the following command to add it to your current session:"
    echo "export PATH=\"$SDK_PATH:\$PATH\""
    echo
    echo "Verify installation by running:"
    echo "  ksc --version"
    echo "  koperator --version"
}

# Run main function
main "$@"