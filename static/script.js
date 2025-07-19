let token = null;

async function signup() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    const res = await fetch('/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role })
    });

    const data = await res.json();
    alert(data.message);
    if (res.ok) {
        getAssignments();
    }
}

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (data.token) {
        token = data.token;
        alert('Login successful!');
        showDashboards();
    } else {
        alert(data.message);
    }
}

function showDashboards() {
    document.getElementById('auth-forms').style.display = 'none';
    document.getElementById('user-dashboards').style.display = 'block';
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    if (decodedToken.role === 'teacher') {
        document.getElementById('teacher-dashboard').style.display = 'block';
    } else {
        document.getElementById('student-dashboard').style.display = 'block';
    }
    getAssignments();
}

async function getAssignments() {
    const res = await fetch('/assignments', {
        headers: { 'x-access-token': token }
    });
    const data = await res.json();
    const list = document.getElementById('assignments-list');
    list.innerHTML = '';
    data.forEach(assignment => {
        const item = document.createElement('div');
        item.className = 'card mb-2';
        item.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${assignment.title} (ID: ${assignment.id})</h5>
                <p class="card-text">${assignment.description}</p>
                <p class="card-text"><small class="text-muted">Due: ${assignment.due_date}</small></p>
            </div>
        `;
        list.appendChild(item);
    });
}

async function createAssignment() {
    const title = document.getElementById('assignment-title').value;
    const description = document.getElementById('assignment-desc').value;
    const due_date = document.getElementById('assignment-due').value;

    const res = await fetch('/assignments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
        },
        body: JSON.stringify({ title, description, due_date })
    });

    const data = await res.json();
    alert(data.message);
}

async function submitAssignment() {
    const assignment_id = document.getElementById('submit-assignment-id').value;
    const content = document.getElementById('submission-content').value;

    const res = await fetch(`/assignments/${assignment_id}/submit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
        },
        body: JSON.stringify({ content })
    });

    const data = await res.json();
    alert(data.message);
}

async function viewSubmissions() {
    const assignment_id = document.getElementById('view-assignment-id').value;
    const res = await fetch(`/assignments/${assignment_id}/submissions`, {
        headers: { 'x-access-token': token }
    });

    const data = await res.json();
    const list = document.getElementById('submissions-list');
    list.innerHTML = '';

    if (res.status === 404) {
        list.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
        return;
    }

    if (data.length === 0) {
        list.innerHTML = '<div class="alert alert-info">No submissions for this assignment yet.</div>';
        return;
    }

    data.forEach(sub => {
        const item = document.createElement('div');
        item.className = 'card mb-2';
        item.innerHTML = `
            <div class="card-body">
                <h6 class="card-subtitle mb-2 text-muted">${sub.student}</h6>
                <p class="card-text">${sub.content}</p>
                <p class="card-text"><small class="text-muted">Submitted on: ${new Date(sub.submission_date).toLocaleString()}</small></p>
            </div>
        `;
        list.appendChild(item);
    });
}
