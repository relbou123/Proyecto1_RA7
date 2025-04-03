#!/bin/bash

# Function to convert a filename to camelCase format.
format_filename() {
    local filename="$1"
    # Trim any extra spaces around the filename.
    filename=$(echo "$filename" | xargs)
    
    # Extract base name and extension.
    local base="${filename%.*}"
    local ext="${filename##*.}"
    
    # Process only if the extension is png (case-insensitive).
    if [[ "${ext,,}" != "png" ]]; then
        return
    fi
    
    # Normalize the base name:
    # Replace underscores, dots, and spaces with a single space, then trim.
    local normalized
    normalized=$(echo "$base" | sed 's/[_\. ]\+/ /g' | sed 's/^ *//;s/ *$//')
    
    # Split the normalized name into words.
    IFS=' ' read -r -a words <<< "$normalized"
    
    local camel=""
    if [ ${#words[@]} -gt 0 ]; then
        # Convert the first word to lowercase.
        camel="${words[0],,}"
        # For each remaining word, capitalize the first letter.
        for (( i = 1; i < ${#words[@]}; i++ )); do
            word="${words[i]}"
            camel+="${word^}"
        done
    fi

    local new_filename="${camel}.png"

    # Rename the file if the new name differs.
    if [ "$filename" != "$new_filename" ]; then
        mv "$filename" "$new_filename"
        echo "Renamed: $filename -> $new_filename"
    fi
}

# Loop through all .png files in the current directory.
for file in *.png; do
    [ -e "$file" ] || continue  # Skip if no .png files are present.
    format_filename "$file"
done
