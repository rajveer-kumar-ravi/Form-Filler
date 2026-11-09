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
    form_id = forms[0]["id"]
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
    assert len(data["questions"]) == 7

    # Submit valid response
    q_map = {q["title"]: q["id"] for q in data["questions"]}
    submission = {
        "respondent_id": "test-runner-01",
        "completion_status": "completed",
        "answers": [
            {"question_id": q_map["What is your full name?"], "answer_value": "Unit Tester"},
            {"question_id": q_map["What is your work email address?"], "answer_value": "tester@example.com"},
            {"question_id": q_map["What is your phone number?"], "answer_value": "9998887777"},
            {"question_id": q_map["How many years of relevant full-stack experience do you have?"], "answer_value": "5 - 8 years"},
            {"question_id": q_map["What are your core technical skills and favorite stack?"], "answer_value": "Python, TypeScript, React"},
            {"question_id": q_map["Are you available to join immediately or within 30 days?"], "answer_value": "Yes"},
            {"question_id": q_map["How would you rate your proficiency with modern reactive frontend UI?"], "answer_value": 5},
        ]
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
