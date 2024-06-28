# MacOS
echo "MacOS: Opening Google Chrome with CORS."
pkill 'Google Chrome'
sleep 1  # Running open command immediately after pkill doesn't work, so add 1 second delay
open -a 'Google Chrome'
