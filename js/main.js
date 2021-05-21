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

function reset_button_state() {
  var icon_div = document.getElementById('video');
  var icon = icon_div.querySelector('i');

  if (!(icon.classList.contains('fa-video'))) {
    icon.classList.remove('fa-video-slash');
    icon.classList.add('fa-video');
  }

  icon_div = document.getElementById('mic');
  icon = icon_div.querySelector('i');

  if (!(icon.classList.contains('fa-microphone'))) {
    icon.classList.remove('fa-microphone-slash');
    icon.classList.add('fa-microphone');
  }
}

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

function quickNotification(text, type = NOTIFICATION_TYPES.INFO, time = 5000) {
  const info = addNotification(type, text);
  setTimeout(() => {
    removeNotification(info);
  }, time);
}

// Messages
function toggle()
{
    var header = document.getElementById('header');
    var messages = document.getElementById('messages');
    var shrink = document.getElementById('shrink');
    header.classList.toggle('active');
    messages.classList.toggle('active');
    shrink.classList.toggle('active');
}

function display_text_message(from,text)
{
  console.log(text);
  text = from + ": " + text;
  let msg_box = document.getElementById("receive-msg");
  
  let pre = document.createElement("pre");
  let node = document.createTextNode(text);
  pre.appendChild(node);

  msg_box.appendChild(pre);

  document.getElementById("send-text").value = '';
}