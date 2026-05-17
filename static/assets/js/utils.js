// TOAST
function toast(msg, type = 'info') {
  const w = document.getElementById('toastWrap');
  const t = document.createElement('div');
  const ic = { success: '✅', error: '❌', info: 'ℹ️' };
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${ic[type] || 'ℹ️'}</span><span>${msg}</span>`;
  w.appendChild(t);
  setTimeout(() => {
    t.style.animation = 'toastOut .28s ease forwards';
    setTimeout(() => t.remove(), 300);
  }, 3200);
}

// FORMAT
function fmt(n) {
  return new Intl.NumberFormat('vi-VN').format(n) + 'đ';
}
function fmtShort(n) {
  return n >= 1000000 ? (n / 1000000).toFixed(1) + 'M' : (n / 1000).toFixed(0) + 'K';
}

// PET TRANSPORT

function updatePreview(){

  document.getElementById('pickupPreview').textContent =
    document.getElementById('tpPickup').value || 'Chưa chọn';

  document.getElementById('dropoffPreview').textContent =
    document.getElementById('tpDropoff').value || 'Chưa chọn';
}


// PAYMENT SELECT

document.addEventListener('click', e => {

  if(e.target.classList.contains('payment-method')){

    document
      .querySelectorAll('.payment-method')
      .forEach(x => x.classList.remove('active'));

    e.target.classList.add('active');
  }

});


// TRANSPORT BOOKING

async function submitTransportBooking(){

  const payload = {

    owner_name:
      document.getElementById('tpOwner').value.trim(),

    owner_phone:
      document.getElementById('tpPhone').value.trim(),

    pet_name:
      document.getElementById('tpPet').value.trim(),

    breed:
      document.getElementById('tpBreed').value.trim(),

    pickup_address:
      document.getElementById('tpPickup').value.trim(),

    dropoff_address:
      document.getElementById('tpDropoff').value.trim(),

    pickup_date:
      document.getElementById('tpDate').value,

    pickup_time:
      document.getElementById('tpTime').value,

    health_condition:
      document.getElementById('tpHealth').value.trim(),

    payment_method:
      document.querySelector('.payment-method.active').textContent.trim()
  };


  if(!payload.owner_name || !payload.owner_phone){

    toast('Vui lòng nhập thông tin!', 'error');
    return;
  }


  try{

    const res = await fetch('/api/transport-booking', {

      method:'POST',

      headers:{
        'Content-Type':'application/json'
      },

      body:JSON.stringify(payload)

    });

    const data = await res.json();

    if(data.ok){

      toast(data.message, 'success');

    }else{

      toast(data.message, 'error');

    }

  }catch(err){

    console.error(err);

    toast('Lỗi kết nối server!', 'error');

  }

}