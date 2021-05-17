document.getElementById('crt_btn').addEventListener('click', function () {
  document.getElementById('create').style.display = 'flex';
})

document.getElementById('join_btn').addEventListener('click', function () {
  document.getElementById('join').style.display = 'flex';
})

var closebtn = document.getElementsByClassName('close');
var i;
for (i = 0; i < closebtn.length; i++) {
  closebtn[i].addEventListener('click', function () {
    this.parentElement.parentElement.style.display = 'none';
  });
}

function toggle_pages(shown, hidden) {
  console.log("toggle");
  document.getElementById(shown).style.display = 'block';
  document.getElementById(hidden).style.display = 'none';
  return false;
}


// js for 2nd part
document.getElementById('mic').addEventListener('click', function () {
  const icon = this.querySelector('i');

  if (icon.classList.contains('fa-microphone')) {
    icon.classList.remove('fa-microphone');
    icon.classList.add('fa-microphone-slash');
  }
  else {
    icon.classList.remove('fa-microphone-slash');
    icon.classList.add('fa-microphone');
  }
})

document.getElementById('video').addEventListener('click', function () {
  const icon = this.querySelector('i');

  if (icon.classList.contains('fa-video')) {
    icon.classList.remove('fa-video');
    icon.classList.add('fa-video-slash');
  }
  else {
    icon.classList.remove('fa-video-slash');
    icon.classList.add('fa-video');
  }
})

// Notifications
const notificationContainer = document.getElementById('notification-container');
const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  DANGER: 'danger'
};

function addNotification(type, text) {
  // create the DIV and add the required classes
  const newNotification = document.createElement('div');
  newNotification.classList.add('notification', `notification-${type}`);

  const innerNotification = `
  <strong>${type}:</strong> ${text}
`;

  // insert the inner elements
  newNotification.innerHTML = innerNotification;

  // add the newNotification to the container
  notificationContainer.appendChild(newNotification);

  return newNotification;
}

function removeNotification(notification) {
  notification.classList.add('hide');

  // remove notification from the DOM after 0.5 seconds
  setTimeout(() => {
    notificationContainer.removeChild(notification);
  }, 500);
}

function quickNotification(text, time = 5000) {
  const info = addNotification(NOTIFICATION_TYPES.INFO, text);
  setTimeout(() => {
    removeNotification(info);
  }, time);
}