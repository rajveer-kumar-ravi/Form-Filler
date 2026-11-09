import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}


def test_list_forms():
    res = client.get("/api/forms")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 2
    assert any(f["title"] == "Senior Full-Stack Engineer Application" for f in data)
    assert any(f["title"] == "FormFlow Product Feedback & Experience" for f in data)


def test_get_form_detail():
    forms = client.get("/api/forms").json()
    target_form = next((f for f in forms if "Senior Full-Stack" in f["title"]), forms[0])
    form_id = target_form["id"]
    res = client.get(f"/api/forms/{form_id}")
    assert res.status_code == 200
    form = res.json()
    assert "questions" in form
    assert len(form["questions"]) > 0


def test_public_form_and_submit():
    # Job application form is published
    res = client.get("/api/public/forms/job-application-2026")
    assert res.status_code == 200
    data = res.json()
    assert data["share_id"] == "job-application-2026"
    assert len(data["questions"]) >= 7

    # Submit valid response
    q_map = {q["title"]: q["id"] for q in data["questions"]}
    answers = []
    for title, q_id in q_map.items():
        if "name" in title.lower():
            answers.append({"question_id": q_id, "answer_value": "Unit Tester"})
        elif "email" in title.lower():
            answers.append({"question_id": q_id, "answer_value": "tester@example.com"})
        elif "phone" in title.lower() or "number" in title.lower():
            answers.append({"question_id": q_id, "answer_value": "9998887777"})
        elif "experience" in title.lower():
            answers.append({"question_id": q_id, "answer_value": "5 - 8 years"})
        elif "technical skills" in title.lower():
            answers.append({"question_id": q_id, "answer_value": "Python, TypeScript, React"})
        elif "available" in title.lower():
            answers.append({"question_id": q_id, "answer_value": "Yes"})
        elif "rate" in title.lower() or "proficiency" in title.lower():
            answers.append({"question_id": q_id, "answer_value": 5})
        elif "resume" in title.lower():
            answers.append({"question_id": q_id, "answer_value": {"filename": "resume.pdf", "url": "/uploads/test.pdf"}})

    submission = {
        "respondent_id": "test-runner-01",
        "completion_status": "completed",
        "answers": answers,
    }
    submit_res = client.post("/api/public/forms/job-application-2026/responses", json=submission)
    assert submit_res.status_code == 201
    assert submit_res.json()["success"] is True


def test_analytics_and_export():
    forms = client.get("/api/forms").json()
    # Find job application form which received responses
    job_form = next(f for f in forms if f["share_id"] == "job-application-2026")
    form_id = job_form["id"]

    analytics_res = client.get(f"/api/forms/{form_id}/analytics")
    assert analytics_res.status_code == 200
    analytics = analytics_res.json()
    assert analytics["total_responses"] >= 3
    assert "questions" in analytics

    export_res = client.get(f"/api/forms/{form_id}/export")
    assert export_res.status_code == 200
    assert "Response ID" in export_res.text


def test_create_and_delete_form():
    # Create
    create_res = client.post("/api/forms", json={"title": "Temporary Test Form", "description": "Temp"})
    assert create_res.status_code == 201
    created = create_res.json()
    f_id = created["id"]
    assert created["status"] == "draft"

    # Add question
    q_res = client.post(f"/api/forms/{f_id}/questions", json={
        "title": "What's your favorite color?",
        "type": "multiple_choice",
        "settings": {"options": ["Red", "Green", "Blue"]}
    })
    assert q_res.status_code == 201

    # Publish
    pub_res = client.post(f"/api/forms/{f_id}/publish")
    assert pub_res.status_code == 200
    assert pub_res.json()["status"] == "published"

    # Delete
    del_res = client.delete(f"/api/forms/{f_id}")
    assert del_res.status_code == 200


def test_file_upload_endpoint():
    files = {"file": ("my_resume.pdf", b"%PDF-1.4 test resume bytes", "application/pdf")}
    res = client.post("/api/upload", files=files)
    assert res.status_code == 201
    data = res.json()
    assert "url" in data
    assert data["filename"] == "my_resume.pdf"
    assert "/uploads/" in data["url"]


def test_session_and_partial_progress():
    # 1. Init new respondent session
    res = client.post("/api/public/forms/job-application-2026/session", json={})
    assert res.status_code == 200
    sess = res.json()
    assert "session_id" in sess
    sess_id = sess["session_id"]
    assert sess["is_new"] is True

    # 2. Save partial progress
    pub_form = client.get("/api/public/forms/job-application-2026").json()
    first_q = pub_form["questions"][0]
    prog_res = client.post("/api/public/forms/job-application-2026/progress", json={
        "session_id": sess_id,
        "current_question_id": first_q["id"],
        "answers": [{"question_id": first_q["id"], "answer_value": "Partial Alice"}]
    })
    assert prog_res.status_code == 200
    assert prog_res.json()["success"] is True

    # 3. Resume session
    resume_res = client.post("/api/public/forms/job-application-2026/session", json={
        "session_id": sess_id
    })
    assert resume_res.status_code == 200
    resumed_data = resume_res.json()
    assert resumed_data["is_new"] is False
    assert resumed_data["session_id"] == sess_id
    assert len(resumed_data["answers"]) >= 1
    assert resumed_data["answers"][0]["answer_value"] == "Partial Alice"


def test_form_settings_and_logic_rules():
    # Create form with logic rules & custom settings
    f_res = client.post("/api/forms", json={
        "title": "Logic Test Form",
        "description": "Testing conditional logic",
        "settings": {
            "response_limit": 50,
            "submit_button_text": "Complete Now",
            "closed_message": "Form is now closed."
        }
    })
    assert f_res.status_code == 201
    form_data = f_res.json()
    f_id = form_data["id"]

    # Add question 1
    q1 = client.post(f"/api/forms/{f_id}/questions", json={
        "title": "Are you a student?",
        "type": "yes_no",
    }).json()

    # Add question 2
    q2 = client.post(f"/api/forms/{f_id}/questions", json={
        "title": "What school do you attend?",
        "type": "short_text",
    }).json()

    # Add question 3
    q3 = client.post(f"/api/forms/{f_id}/questions", json={
        "title": "Where do you work?",
        "type": "short_text",
    }).json()

    # Configure logic jump on Q1: If No -> Jump to Q3
    update_q1 = client.put(f"/api/questions/{q1['id']}", json={
        "logic_rules": [
            {
                "condition": "equals",
                "value": "No",
                "target_question_id": q3["id"]
            }
        ]
    })
    assert update_q1.status_code == 200
    assert len(update_q1.json()["logic_rules"]) == 1

    # Cleanup
    client.delete(f"/api/forms/{f_id}")

