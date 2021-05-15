document.getElementById('crt_btn').addEventListener('click',function() {
  document.getElementById('create').style.display = 'flex';
})

document.getElementById('join_btn').addEventListener('click',function() {
  document.getElementById('join').style.display = 'flex';
})

var closebtn = document.getElementsByClassName('close');
var i;
for (i=0; i < closebtn.length; i++)
{
  closebtn[i].addEventListener('click', function() {
    this.parentElement.parentElement.style.display = 'none';
  });
}

function show(shown, hidden) {
  document.getElementById(shown).style.display='block';
  document.getElementById(hidden).style.display='none';
  return false;
}


// js for 2nd part
document.getElementById('mic').addEventListener('click', function() {
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

document.getElementById('video').addEventListener('click', function() {
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
