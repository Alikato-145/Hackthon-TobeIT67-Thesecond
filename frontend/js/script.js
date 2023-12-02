import {API} from '../config.json';
alert('test')
function sendEmail() {
   const emailValue = document.getElementById("emailReset").value;
   const btn = document.getElementById("SendToken")
   // ส่วนนี้คือการทำ HTTP request ไปยัง API โดยใช้ fetch
   fetch(`${API}api/account/forgot-password`, {
       method: 'POST',
       headers: {
           'Content-Type': 'application/json', // ระบุว่าข้อมูลที่ส่งไปเป็น JSON
       },
       body: JSON.stringify({ email: emailValue }) // แปลงข้อมูลเป็น JSON และส่งไปยัง API
   })
   .then(response => response.json()) // แปลง response เป็น JSON format
   .then(data => {
       if(data.success == true ){
         document.getElementById("emailReset").setAttribute('disabled', 'true')
         btn.classList.add('btnDis')
         msg = 'The password reset token has been sent to '+"<span style='color: #D54873;'>"+emailValue+"</span>"
         document.getElementById('msgRepass').innerHTML = msg
         document.getElementById('confrimToken').setAttribute('style','display: flex; flex-direction: column; align-items: center;')
         console.log("dee")
   }

   })
   .catch(error => {
       // ทำอย่างอื่นต่อไปที่ต้องการเมื่อเกิด error
         msg = 'error, Please try again.'
         document.getElementById('msgRepass').innerHTML = msg
   });

   
}

function focusSearch(){
   document.getElementById('searchBar').classList.add('searchBarFocus');
}

function focusblur(){
   document.getElementById('searchBar').classList.remove('searchBarFocus');
}

// function searchCloce() {
//    document.getElementById('')
// }

function login(){
   const username = document.getElementById('username').value;
   const password = document.getElementById('password').value;
   fetch('https://backend-deploy-theta-sand.vercel.app/api/auth/login', {
       method: 'POST',
       headers: {
           'Content-Type': 'application/json', // ระบุว่าข้อมูลที่ส่งไปเป็น JSON
       },
       body: JSON.stringify({ username: username,password:password}) // แปลงข้อมูลเป็น JSON และส่งไปยัง API
   })
   .then(response => response.json()) // แปลง response เป็น JSON format
   .then(data => {
      if(data.success == true){
         window.location.href = 'main.html';
      }
      console.log(data)

   })
   .catch(error => {
       // ทำอย่างอื่นต่อไปที่ต้องการเมื่อเกิด error
         msg = 'error, Please try again.'
         document.getElementById('msgRepass').innerHTML = msg
   });
}

function register() {
   const username = document.getElementById('username').value;
   const password = document.getElementById('password').value;
   const email = document.getElementById('email').value;
   const phone = document.getElementById('phone').value;
}




function resetPass(){
   const token = document.getElementById('Token').value
   const password = document.getElementById('NewPass').value
   fetch('https://backend-deploy-theta-sand.vercel.app/api/account/reset-password-with-token', {
       method: 'PATCH',
       headers: {
           'Content-Type': 'application/json', // ระบุว่าข้อมูลที่ส่งไปเป็น JSON
       },
       body: JSON.stringify({token:token ,password:password}) // แปลงข้อมูลเป็น JSON และส่งไปยัง API
   })

   .then(response => response.json()) // แปลง response เป็น JSON format

   .then(data => {
         console.log(data)

         if(data.success == true){
            
            let count = 10; // เวลาที่ต้องการให้นับถอยหลัง (ในตัวอย่างนี้คือ 10 วินาที)
            let ID = document.getElementById('msg-repass')
            let countdown = setInterval(function() {
            ID.innerHTML = "เปลี่ยนรหัสผ่านแล้ว! จะไปหน้าlogin ในอีก " + count + " วินาที" + "<a  class='btn' style='margin-left:25px;' href='login.html'>กลับหน้าหลัก</a>"
            count--; // ลดค่าทีละหนึ่งหน่วย
             if (count === 0) {
                 clearInterval(countdown); // เมื่อนับถอยหลังครบ หยุดการนับ
                 window.location.href = 'login.html';
             }
         }, 1000); // เรียกใช้ทุกๆ 1 วินาที (1000 milliseconds)
         }
         // console.log(usernameDispaly)
         // document.getElementById('usernameDisplay').innerHTML = usernameDispaly;
      // console.log(data)

   })
   .catch(error => {
       // ทำอย่างอื่นต่อไปที่ต้องการเมื่อเกิด error
         msg = 'error, Please try again.'
         document.getElementById('msgRepass').innerHTML = msg
   });
}

console.log(dataResult)