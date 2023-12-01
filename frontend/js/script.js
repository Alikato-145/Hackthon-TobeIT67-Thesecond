function sendEmail() {
   const emailValue = document.getElementById("emailReset").value;
   const btn = document.getElementById("SendToken")
   // ส่วนนี้คือการทำ HTTP request ไปยัง API โดยใช้ fetch
   fetch('https://backend-deploy-theta-sand.vercel.app/api/account/forgot-password', {
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
