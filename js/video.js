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
