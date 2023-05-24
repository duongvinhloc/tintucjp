// script.js
//import { executeFunctions } from '../main.js';

  document.addEventListener('DOMContentLoaded', function() {
    var myButton = document.getElementById('myButton');
    if (myButton) {
      myButton.addEventListener('click', myFunction);
    }
  });
  
  function myFunction() {
    // Đoạn mã JavaScript bạn muốn thực hiện khi button được click
    alert('Button clicked!');
    // ...
  }