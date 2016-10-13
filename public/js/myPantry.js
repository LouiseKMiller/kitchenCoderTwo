  $(document).ready(function(startCatID) {


    $('#pantryList').find(target).toggleClass('hidden');
    $('#catList').find(catButton).toggleClass('chosenCat');

  // {{! *********** CLICK ON CATEGORY ****}}
    $('.categorySection').on('click', function(event){
      event.stopPropagation();
      console.log("clicked ", target);
      $('#catList').find(catButton).toggleClass('chosenCat');
      $('#pantryList').find(target).toggleClass('hidden');


      var category = $(this).attr('data-catID');
      target = '.catID' + category;
      console.log("clicked ", target);
      catButton = $(this);

      $(this).toggleClass('chosenCat');
      $('#pantryList').find(target).toggleClass('hidden');
    })

  // {{!-- *********** CLICK ON INGREDIENT BUTTON **** --}}
  // {{!-- ********* Change pantry status of ingredient *** --}}

    $('#pantryList').on('click', '.ingrButton', function(){
      event.stopPropagation();
      var updateURL = "myPantry/update/" + $(this).attr('data-id');
      var ingButton = $(this);
      var value = $(this).attr('data-pantryStatus');
      $.post(updateURL,
        {inPantry: value},
        function(result){
          if(result == "0"){
            ingButton.removeClass('inPantryStyle');
            ingButton.find('i').removeClass('fa-check');
            ingButton.addClass('allOutStyle');
            ingButton.find('i').addClass('fa-ban');
            ingButton.attr('data-pantryStatus', '1');
          } else {
            ingButton.removeClass('allOutStyle');
            ingButton.find('i').removeClass('fa-ban');
            ingButton.addClass('inPantryStyle');
            ingButton.find('i').addClass('fa-check');
            ingButton.attr('data-pantryStatus', '0');
          }
        })
    });

  // {{!-- *********** CLICK ON GROCERY LIST BUTTON **** --}}
  // {{!-- ********* Add ingredient to grocery list ***** --}}

    $('#pantryList').on('click', '.groceryListButton', function(){
      event.stopPropagation();
      var ingrName =  $(this).attr('data-name');
      var note = prompt("Enter quantity");
      var updateURL = "groceryList/add/" + $(this).attr('data-id');
      $.post(updateURL,
        {note: note,
         name: ingrName},
        function(result){
          console.log("you are here now");
          $('#groceryList').append('<li>' + ingrName + '  ---  ' + note + '</li>');
      })
    });


  // {{!-- *********** CLICK ON DELETE BUTTON *********** --}}
  // {{!-- **** Delete ingredient from grocery list ***** --}}


  // {{!-- ************** CLICK ON CLEAR ALL BUTTON ********* --}}
  // {{!-- **** Clear all ingredients from grocery list ***** --}}

    $('#clearList').on('click', function(){
      event.stopPropagation();
      $.get('groceryList/clear',
      function(result){
        console.log(result);
        $('#groceryList').empty();
      });
    });

  // {{!-- *********** CLICK ON PRINT BUTTON **** --}}
  // {{!-- ************* Print grocery list ***** --}}

    $('#printList').on('click', function(){
      event.stopPropagation();

    });

  });
