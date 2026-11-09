import os
import subprocess

CHROME_BIN = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUTPUT_DIR = os.path.abspath("frontend/public/guide")
os.makedirs(OUTPUT_DIR, exist_ok=True)

PAGES = [
    ("01-dashboard.png", "http://localhost:3000/dashboard", "1280,820"),
    ("02-create-form.png", "http://localhost:3000/forms/new", "1280,820"),
    ("03-builder-overview.png", "http://localhost:3000/forms/1/builder", "1360,850"),
    ("07-settings-publish.png", "http://localhost:3000/forms/1/settings", "1280,850"),
    ("08-respondent-welcome.png", "http://localhost:3000/form/job-application-2026", "1280,800"),
    ("09-results-analytics.png", "http://localhost:3000/forms/1/results", "1280,850"),
    ("09-response-detail.png", "http://localhost:3000/forms/1/responses/1", "1280,850"),
]

def capture_all():
    print(f"Capturing screenshots to {OUTPUT_DIR}...")
    for filename, url, size in PAGES:
        dest_path = os.path.join(OUTPUT_DIR, filename)
        cmd = [
            CHROME_BIN,
            "--headless=new",
            "--disable-gpu",
            "--hide-scrollbars",
            "--virtual-time-budget=4000",
            f"--window-size={size}",
            f"--screenshot={dest_path}",
            url
        ]
        print(f"Capturing {filename} from {url}...")
        try:
            subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=25)
            if os.path.exists(dest_path):
                print(f" -> Saved {filename} ({os.path.getsize(dest_path)} bytes)")
            else:
                print(f" -> Failed to save {filename}")
        except Exception as e:
            print(f"Error capturing {filename}: {e}")

if __name__ == "__main__":
    capture_all()
