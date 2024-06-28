# MacOS
echo "MacOS: Opening Google Chrome with no CORS."
pkill 'Google Chrome'
sleep 1  # Running open command immediately after pkill doesn't work, so add 1 second delay
PRIMARY_CHROME_DIR="${HOME}/Library/Application Support/Google/Chrome/chrome-rve-editor"
mkdir -p "${PRIMARY_CHROME_DIR}"
open -a 'Google Chrome' --args --user-data-dir="${PRIMARY_CHROME_DIR}" --disable-web-security
