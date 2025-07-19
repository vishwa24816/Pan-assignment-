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
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    if (decodedToken.role === 'teacher') {
        document.getElementById('teacher-dashboard').style.display = 'block';
        document.getElementById('view-submissions-dashboard').style.display = 'block';
    } else {
        document.getElementById('student-dashboard').style.display = 'block';
    }
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

    if (data.message) {
        list.innerHTML = data.message;
    } else {
        data.forEach(sub => {
            const item = document.createElement('div');
            item.innerHTML = `<b>${sub.student}:</b><p>${sub.content}</p>`;
            list.appendChild(item);
        });
    }
}
