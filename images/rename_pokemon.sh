#!/bin/bash

# Function to convert a filename into camelCase format.
format_filename() {
    local filename="$1"
    # Trim any leading/trailing whitespace in the filename.
    filename=$(echo "$filename" | xargs)
    
    # Separate the base (name) and extension; also trim extra spaces.
    local base=$(echo "${filename%.*}" | xargs)
    local ext=$(echo "${filename##*.}" | xargs)
    
    # Only process if the extension is 'png' (case-insensitive)
    if [[ "${ext,,}" != "png" ]]; then
        return
    fi

    # Replace one or more dots with a space.
    # This also handles extra spaces: we replace multiple spaces with a single space and trim.
    local normalized=$(echo "$base" | sed 's/[.]\+/ /g' | sed 's/  */ /g' | sed 's/^ *//;s/ *$//')
    
    # Split the normalized name into an array of words using space as delimiter.
    IFS=' ' read -r -a words <<< "$normalized"
    
    local camel=""
    if [ ${#words[@]} -gt 0 ]; then
        # First word: convert all letters to lowercase.
        camel="${words[0],,}"
        # For each remaining word, uppercase its first letter and keep the rest unchanged.
        for ((i = 1; i < ${#words[@]}; i++)); do
            word="${words[i]}"
            camel+="${word^}"
        done
    fi

    local new_filename="${camel}.png"

    # Rename the file if the new name differs from the original
    if [ "$filename" != "$new_filename" ]; then
        mv "$filename" "$new_filename"
        echo "Renamed: $filename -> $new_filename"
    fi
}

# Loop over all .png files in the current directory.
for file in *.png; do
    [ -e "$file" ] || continue  # Skip if no .png files are found.
    format_filename "$file"
done
