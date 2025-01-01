import pandas as pd

# Load the CSV
data = pd.read_csv('zipcodes.csv', header=None)

# Extract provider names from the first row (header)
providers = data.iloc[0, 1:].tolist()  # Skip the first column (ZIP codes)

# Initialize a dictionary to map ZIP codes to providers
zip_provider_map = {}

# Iterate through each column (starting from the second column)
for col_index, provider in enumerate(providers, start=1):
    for index, row in data.iterrows():
        if index == 0:  # Skip the header row
            continue
        zip_code = row[col_index]  # Current ZIP code
        if pd.notna(zip_code):  # Check if the ZIP code is valid
            zip_code = str(zip_code).strip()
            # Add provider to the ZIP code entry
            if zip_code not in zip_provider_map:
                zip_provider_map[zip_code] = set()  # Use a set to avoid duplicates
            zip_provider_map[zip_code].add(provider)

# Convert the map to a DataFrame
output_data = pd.DataFrame({
    "ZipCode": list(zip_provider_map.keys()),
    "Providers": ["; ".join(sorted(providers)) for providers in zip_provider_map.values()]
})

# Save to a new CSV file
output_data.to_csv('reshaped_zipcodes.csv', index=False)

print("Processed and saved the reshaped CSV as 'reshaped_zipcodes.csv'")
