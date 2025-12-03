// Check if user is logged in
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Display user info
    document.getElementById('userName').textContent = currentUser.fullname || 'Learner';
    document.getElementById('userAvatar').textContent = getInitials(currentUser.fullname || 'L');
    
    // Sample course data
    const courses = [
        {
            id: 1,
            title: "Introduction to Web Development",
            instructor: "Sarah Johnson",
            progress: 65,
            image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
        },
        {
            id: 2,
            title: "JavaScript Fundamentals",
            instructor: "Mike Chen",
            progress: 30,
            image: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
        },
        {
            id: 3,
            title: "Advanced CSS Techniques",
            instructor: "Emma Davis",
            progress: 15,
            image: "https://images.unsplash.com/photo-1523437113738-bbd3cc89fb19?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
        }
    ];

    // Display courses
    const coursesContainer = document.getElementById('continueLearning');
    courses.forEach(course => {
        coursesContainer.innerHTML += `
            <div class="course-card">
                <div class="course-image" style="background-image: url('${course.image}')"></div>
                <div class="course-content">
                    <h3 class="course-title">${course.title}</h3>
                    <p class="course-instructor">${course.instructor}</p>
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress" style="width: ${course.progress}%"></div>
                        </div>
                        <p class="progress-text">${course.progress}% complete</p>
                    </div>
                    <button class="btn-continue" onclick="continueCourse(${course.id})">Continue</button>
                </div>
            </div>
        `;
    });

    // Update stats (in a real app, these would come from the server)
    updateLearningStats();
});

function getInitials(name) {
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
}

function continueCourse(courseId) {
    alert(`Continuing course ${courseId} - this would redirect to the course player in a real app`);
    // window.location.href = `course.html?id=${courseId}`;
}

function updateLearningStats() {
    // In a real app, these would be fetched from an API
    const stats = {
        enrolled: 5,
        certificates: 2,
        hours: 24.5
    };
    
    document.getElementById('enrolledCount').textContent = stats.enrolled;
    document.getElementById('certificateCount').textContent = stats.certificates;
    document.getElementById('learningHours').textContent = stats.hours;
}

// Logout functionality (you would add this to a user dropdown menu)
function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}