## Setup

1. Download this repository and run `npm install`.
2. Create a new folder called `data` and insert your Redcoat annotation files into that folder.
3. Run the build script: `python build_data.py`.
4. Run the tool with `npm start`.
5. Navigate to `localhost:3000` in your browser.

## Todo

- Add pagination (it's a bit slow rendering 500 docs at a time)
- Add dynamic labels (at the moment the category is hardcoded in `src/App.js`)