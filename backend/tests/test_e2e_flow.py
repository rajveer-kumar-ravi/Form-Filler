import requests
import socket
import pytest

BASE_URL = "http://127.0.0.1:8000"


def is_server_running(host="127.0.0.1", port=8000):
    try:
        with socket.create_connection((host, port), timeout=1):
            return True
    except OSError:
        return False


@pytest.mark.skipif(not is_server_running(), reason="Live FastAPI server not running on port 8000")
def test_full_flow():
    print("1. Checking API health...")
    r = requests.get(f"{BASE_URL}/api/health")
    assert r.status_code == 200, f"Health check failed: {r.text}"
    print("   Health OK!")

    print("2. Fetching existing seeded forms...")
    r = requests.get(f"{BASE_URL}/api/forms")
    assert r.status_code == 200
    forms = r.json()
    assert len(forms) >= 2
    print(f"   Found {len(forms)} forms. Seed data verified.")

    print("3. Creating a new test form...")
    payload = {
        "title": "Comprehensive E2E Assessment Survey",
        "description": "Testing the full lifecycle of FormFlow",
        "theme_config": {"primaryColor": "#6366F1", "backgroundColor": "#FFFFFF"},
        "welcome_screen": {"enabled": True, "title": "Welcome!", "description": "Quick survey", "buttonText": "Begin"},
        "thank_you_screen": {"enabled": True, "title": "Done!", "description": "Thanks a lot", "buttonText": "Restart"}
    }
    r = requests.post(f"{BASE_URL}/api/forms", json=payload)
    assert r.status_code == 201
    new_form = r.json()
    form_id = new_form["id"]
    share_id = new_form["share_id"]
    print(f"   Created Form ID {form_id} with share_id '{share_id}' (Status: {new_form['status']})")

    print("4. Adding questions of different types...")
    # Q1: Short text
    q1 = requests.post(f"{BASE_URL}/api/forms/{form_id}/questions", json={
        "title": "What is your developer handle?",
        "type": "short_text",
        "required": True,
        "settings": {"placeholder": "@handle"}
    }).json()

    # Q2: Multiple choice
    q2 = requests.post(f"{BASE_URL}/api/forms/{form_id}/questions", json={
        "title": "Which cloud do you deploy to?",
        "type": "multiple_choice",
        "required": True,
        "settings": {"options": ["AWS", "Google Cloud", "Azure", "Vercel / Railway"]}
    }).json()

    # Q3: Rating
    q3 = requests.post(f"{BASE_URL}/api/forms/{form_id}/questions", json={
        "title": "Rate the FormFlow builder UI",
        "type": "rating",
        "required": True,
        "settings": {"scale": 5, "minLabel": "Clunky", "maxLabel": "Elite"}
    }).json()

    # Q4: Yes / No
    q4 = requests.post(f"{BASE_URL}/api/forms/{form_id}/questions", json={
        "title": "Would you recommend this stack?",
        "type": "yes_no",
        "required": True
    }).json()

    print(f"   Added 4 questions to Form {form_id}")

    print("5. Testing Drag & Drop Question Reordering API...")
    reorder_payload = {
        "questions": [
            {"id": q3["id"], "position": 0},
            {"id": q1["id"], "position": 1},
            {"id": q4["id"], "position": 2},
            {"id": q2["id"], "position": 3},
        ]
    }
    r = requests.put(f"{BASE_URL}/api/forms/{form_id}/questions/reorder", json=reorder_payload)
    assert r.status_code == 200
    print("   Reorder succeeded!")

    print("6. Verifying public access is blocked while in draft mode...")
    r = requests.get(f"{BASE_URL}/api/public/forms/{share_id}")
    assert r.status_code == 403, "Unpublished form should return 403"
    print("   Draft protection verified (status 403)!")

    print("7. Publishing form...")
    r = requests.post(f"{BASE_URL}/api/forms/{form_id}/publish")
    assert r.status_code == 200
    assert r.json()["status"] == "published"
    print("   Form published successfully!")

    print("8. Fetching public form data...")
    r = requests.get(f"{BASE_URL}/api/public/forms/{share_id}")
    assert r.status_code == 200
    pub_data = r.json()
    assert len(pub_data["questions"]) == 4
    # Check that position ordering is respected
    assert pub_data["questions"][0]["id"] == q3["id"]
    print("   Public form fetched and question reordering confirmed in public view!")

    print("9. Submitting a respondent answer set...")
    submission = {
        "respondent_id": "e2e-bot-99",
        "completion_status": "completed",
        "answers": [
            {"question_id": q3["id"], "answer_value": 5},
            {"question_id": q1["id"], "answer_value": "antigravity_dev"},
            {"question_id": q4["id"], "answer_value": "Yes"},
            {"question_id": q2["id"], "answer_value": "Google Cloud"},
        ]
    }
    r = requests.post(f"{BASE_URL}/api/public/forms/{share_id}/responses", json=submission)
    assert r.status_code == 201
    resp_id = r.json()["response_id"]
    print(f"   Submitted response successfully (Response ID: {resp_id})!")

    print("10. Checking results and analytics...")
    r = requests.get(f"{BASE_URL}/api/forms/{form_id}/analytics")
    assert r.status_code == 200
    analytics = r.json()
    assert analytics["total_responses"] == 1
    assert analytics["completion_rate"] == 100.0

    print("11. Verifying CSV export...")
    r = requests.get(f"{BASE_URL}/api/forms/{form_id}/export")
    assert r.status_code == 200
    assert "antigravity_dev" in r.text
    print("   CSV export verified!")

    print("12. Testing form duplication...")
    r = requests.post(f"{BASE_URL}/api/forms/{form_id}/duplicate")
    assert r.status_code == 200
    dup_form = r.json()
    assert "(Copy)" in dup_form["title"]
    assert len(dup_form["questions"]) == 4
    print(f"   Form duplicated successfully as ID {dup_form['id']}!")

    print("\nALL 12 END-TO-END FLOW TESTS PASSED PERFECTLY!")

if __name__ == "__main__":
    test_full_flow()
