


function addToCart(proId) {
    $.ajax({
      url: "/addToCart/" + proId,
      method: "post",
      cache: false,
      success: (response) => {
        console.log('lskdjf',response);
       
        if (response.status) {
          let count = $("#cart-count").text();
          console.log(count,"countcountcount");
          count = parseInt(count) + 1;       
          $("#cart-count").html(count); 
          alert('product added')
           
        } else if(response.limit){
          alert('product added')
        } else {
          location.replace('/login')
        }
      },
    });
  }



function addToWishlist(proId) {
    $.ajax({
        url: '/addToWishlist/' + proId,
        method: 'get',
        success: (response) => {
            if (response.status) {
                let count = $("#wishlist-count").html()
                count = parseInt(count) + 1
                $("#wishlist-count").html(count)
               
            }else{
                alert('already added')
            }
        }
    })
}
