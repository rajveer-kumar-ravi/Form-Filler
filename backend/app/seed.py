import datetime
from sqlalchemy.orm import Session
from backend.app.database import SessionLocal, engine, Base
from backend.app import models


def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # Check if already seeded
        existing_forms = db.query(models.Form).count()
        if existing_forms > 0:
            print("Database already contains forms. Skipping seed.")
            return

        print("Seeding initial data...")

        # 1. Default user
        user = models.User(
            name="Rajveer Kumar",
            email="creator@formflow.io"
        )
        db.add(user)
        db.flush()

        # 2. Form 1: Job Application Form
        form_job = models.Form(
            user_id=user.id,
            title="Senior Full-Stack Engineer Application",
            description="Join our fast-growing engineering team at FormFlow. We are looking for talented developers who love building polished software.",
            share_id="job-application-2026",
            status="published",
            theme_config={
                "primaryColor": "#6366F1",
                "backgroundColor": "#FFFFFF",
                "textColor": "#0F172A",
                "fontFamily": "Inter",
                "borderRadius": "rounded-2xl"
            },
            welcome_screen={
                "enabled": True,
                "title": "Senior Engineer Application",
                "description": "Thank you for your interest in joining FormFlow. This will take about 2-3 minutes.",
                "buttonText": "Start Application"
            },
            thank_you_screen={
                "enabled": True,
                "title": "Application Received!",
                "description": "We will review your application and get back to you within 48 hours. Best of luck!",
                "buttonText": "Submit Another Response"
            }
        )
        db.add(form_job)
        db.flush()

        # Form 1 Questions
        q_job_1 = models.Question(
            form_id=form_job.id,
            title="What is your full name?",
            description="First and last name please",
            type="short_text",
            position=0,
            required=True,
            settings={"placeholder": "e.g. Alex Mercer"}
        )
        q_job_2 = models.Question(
            form_id=form_job.id,
            title="What is your work email address?",
            description="We'll use this to coordinate interviews",
            type="email",
            position=1,
            required=True,
            settings={"placeholder": "alex@company.com"}
        )
        q_job_3 = models.Question(
            form_id=form_job.id,
            title="What is your phone number?",
            description="Including country code if applicable",
            type="number",
            position=2,
            required=False,
            settings={"placeholder": "1234567890"}
        )
        q_job_4 = models.Question(
            form_id=form_job.id,
            title="How many years of relevant full-stack experience do you have?",
            description="Select the bracket that best describes your experience",
            type="multiple_choice",
            position=3,
            required=True,
            settings={
                "options": [
                    "1 - 2 years",
                    "3 - 5 years",
                    "5 - 8 years",
                    "8+ years"
                ]
            }
        )
        q_job_5 = models.Question(
            form_id=form_job.id,
            title="What are your core technical skills and favorite stack?",
            description="Feel free to mention frontend frameworks, backend languages, databases, or cloud providers",
            type="long_text",
            position=4,
            required=True,
            settings={"placeholder": "e.g. Next.js, TypeScript, Python FastAPI, PostgreSQL, Docker"}
        )
        q_job_6 = models.Question(
            form_id=form_job.id,
            title="Are you available to join immediately or within 30 days?",
            description="Notice period availability",
            type="yes_no",
            position=5,
            required=True,
            settings={}
        )
        q_job_7 = models.Question(
            form_id=form_job.id,
            title="How would you rate your proficiency with modern reactive frontend UI?",
            description="1 (Beginner) to 5 (World-Class)",
            type="rating",
            position=6,
            required=True,
            settings={"scale": 5, "minLabel": "Developing", "maxLabel": "Expert"}
        )

        db.add_all([q_job_1, q_job_2, q_job_3, q_job_4, q_job_5, q_job_6, q_job_7])
        db.flush()

        # 3. Form 2: Customer Feedback Form
        form_feedback = models.Form(
            user_id=user.id,
            title="FormFlow Product Feedback & Experience",
            description="Help us make FormFlow better! We'd love your candid thoughts on your recent experience.",
            share_id="product-feedback-2026",
            status="published",
            theme_config={
                "primaryColor": "#8B5CF6",
                "backgroundColor": "#FAFAFA",
                "textColor": "#1E1B4B",
                "fontFamily": "Inter",
                "borderRadius": "rounded-2xl"
            },
            welcome_screen={
                "enabled": True,
                "title": "We Value Your Feedback",
                "description": "It takes less than 60 seconds to share your thoughts and shape our roadmap.",
                "buttonText": "Give Feedback"
            },
            thank_you_screen={
                "enabled": True,
                "title": "Thank you for the love!",
                "description": "Your insights help our product and design team craft delightful tools for everyone.",
                "buttonText": "Done"
            }
        )
        db.add(form_feedback)
        db.flush()

        # Form 2 Questions
        q_fb_1 = models.Question(
            form_id=form_feedback.id,
            title="What is your name?",
            description="So we know who to follow up with",
            type="short_text",
            position=0,
            required=True,
            settings={"placeholder": "e.g. Sarah Connor"}
        )
        q_fb_2 = models.Question(
            form_id=form_feedback.id,
            title="What is your email address?",
            description="Optional if you prefer staying anonymous",
            type="email",
            position=1,
            required=False,
            settings={"placeholder": "sarah@example.com"}
        )
        q_fb_3 = models.Question(
            form_id=form_feedback.id,
            title="How would you rate your overall experience with FormFlow?",
            description="On a scale from 1 to 5 stars",
            type="rating",
            position=2,
            required=True,
            settings={"scale": 5, "minLabel": "Poor", "maxLabel": "Delightful"}
        )
        q_fb_4 = models.Question(
            form_id=form_feedback.id,
            title="How satisfied are you with our form builder speed and ease of use?",
            description="Choose the option that matches best",
            type="multiple_choice",
            position=3,
            required=True,
            settings={
                "options": [
                    "Extremely Satisfied",
                    "Very Satisfied",
                    "Neutral",
                    "Needs Improvement"
                ]
            }
        )
        q_fb_5 = models.Question(
            form_id=form_feedback.id,
            title="Would you recommend FormFlow to friends or colleagues?",
            description="Net promoter question",
            type="yes_no",
            position=4,
            required=True,
            settings={}
        )
        q_fb_6 = models.Question(
            form_id=form_feedback.id,
            title="Any additional thoughts, feature requests, or improvements?",
            description="We read every single comment!",
            type="long_text",
            position=5,
            required=False,
            settings={"placeholder": "I really loved the drag and drop and smooth transitions..."}
        )

        db.add_all([q_fb_1, q_fb_2, q_fb_3, q_fb_4, q_fb_5, q_fb_6])
        db.flush()

        # 4. Add at least 5 sample responses across the forms
        # Sample Response 1 (Job application)
        r1 = models.Response(
            form_id=form_job.id,
            respondent_id="resp-candidate-001",
            completion_status="completed",
            submitted_at=datetime.datetime.utcnow() - datetime.timedelta(days=2, hours=3)
        )
        db.add(r1)
        db.flush()
        db.add_all([
            models.Answer(response_id=r1.id, question_id=q_job_1.id, answer_value="Elena Rostova"),
            models.Answer(response_id=r1.id, question_id=q_job_2.id, answer_value="elena.rostova@techcorp.io"),
            models.Answer(response_id=r1.id, question_id=q_job_3.id, answer_value="4155550192"),
            models.Answer(response_id=r1.id, question_id=q_job_4.id, answer_value="5 - 8 years"),
            models.Answer(response_id=r1.id, question_id=q_job_5.id, answer_value="TypeScript, React/Next.js, Python FastAPI, PostgreSQL, Tailwind, GraphQL, Redis, AWS."),
            models.Answer(response_id=r1.id, question_id=q_job_6.id, answer_value="Yes"),
            models.Answer(response_id=r1.id, question_id=q_job_7.id, answer_value=5),
        ])

        # Sample Response 2 (Job application)
        r2 = models.Response(
            form_id=form_job.id,
            respondent_id="resp-candidate-002",
            completion_status="completed",
            submitted_at=datetime.datetime.utcnow() - datetime.timedelta(days=1, hours=7)
        )
        db.add(r2)
        db.flush()
        db.add_all([
            models.Answer(response_id=r2.id, question_id=q_job_1.id, answer_value="Marcus Vance"),
            models.Answer(response_id=r2.id, question_id=q_job_2.id, answer_value="m.vance@studio.dev"),
            models.Answer(response_id=r2.id, question_id=q_job_3.id, answer_value="2065550144"),
            models.Answer(response_id=r2.id, question_id=q_job_4.id, answer_value="8+ years"),
            models.Answer(response_id=r2.id, question_id=q_job_5.id, answer_value="Distributed systems architect, Python backend, Next.js frontend, microservices, Kubernetes."),
            models.Answer(response_id=r2.id, question_id=q_job_6.id, answer_value="No"),
            models.Answer(response_id=r2.id, question_id=q_job_7.id, answer_value=4),
        ])

        # Sample Response 3 (Job application)
        r3 = models.Response(
            form_id=form_job.id,
            respondent_id="resp-candidate-003",
            completion_status="completed",
            submitted_at=datetime.datetime.utcnow() - datetime.timedelta(hours=14)
        )
        db.add(r3)
        db.flush()
        db.add_all([
            models.Answer(response_id=r3.id, question_id=q_job_1.id, answer_value="Priya Sharma"),
            models.Answer(response_id=r3.id, question_id=q_job_2.id, answer_value="priya.sharma@innovate.co"),
            models.Answer(response_id=r3.id, question_id=q_job_3.id, answer_value="919876543210"),
            models.Answer(response_id=r3.id, question_id=q_job_4.id, answer_value="3 - 5 years"),
            models.Answer(response_id=r3.id, question_id=q_job_5.id, answer_value="React, Next.js App Router, Tailwind CSS, FastAPI, SQLite, Docker, Framer Motion."),
            models.Answer(response_id=r3.id, question_id=q_job_6.id, answer_value="Yes"),
            models.Answer(response_id=r3.id, question_id=q_job_7.id, answer_value=5),
        ])

        # Sample Response 4 (Feedback)
        r4 = models.Response(
            form_id=form_feedback.id,
            respondent_id="resp-feedback-001",
            completion_status="completed",
            submitted_at=datetime.datetime.utcnow() - datetime.timedelta(days=1, hours=2)
        )
        db.add(r4)
        db.flush()
        db.add_all([
            models.Answer(response_id=r4.id, question_id=q_fb_1.id, answer_value="Samantha Reed"),
            models.Answer(response_id=r4.id, question_id=q_fb_2.id, answer_value="samantha@productlead.co"),
            models.Answer(response_id=r4.id, question_id=q_fb_3.id, answer_value=5),
            models.Answer(response_id=r4.id, question_id=q_fb_4.id, answer_value="Extremely Satisfied"),
            models.Answer(response_id=r4.id, question_id=q_fb_5.id, answer_value="Yes"),
            models.Answer(response_id=r4.id, question_id=q_fb_6.id, answer_value="The conversational flow feels so slick! It literally tripled our survey completion rate."),
        ])

        # Sample Response 5 (Feedback)
        r5 = models.Response(
            form_id=form_feedback.id,
            respondent_id="resp-feedback-002",
            completion_status="completed",
            submitted_at=datetime.datetime.utcnow() - datetime.timedelta(hours=5)
        )
        db.add(r5)
        db.flush()
        db.add_all([
            models.Answer(response_id=r5.id, question_id=q_fb_1.id, answer_value="David Kim"),
            models.Answer(response_id=r5.id, question_id=q_fb_2.id, answer_value="davidk@startup.io"),
            models.Answer(response_id=r5.id, question_id=q_fb_3.id, answer_value=4),
            models.Answer(response_id=r5.id, question_id=q_fb_4.id, answer_value="Very Satisfied"),
            models.Answer(response_id=r5.id, question_id=q_fb_5.id, answer_value="Yes"),
            models.Answer(response_id=r5.id, question_id=q_fb_6.id, answer_value="Drag and drop is butter smooth. Would love even more question types in the future!"),
        ])

        db.commit()
        print("Successfully seeded FormFlow database!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
