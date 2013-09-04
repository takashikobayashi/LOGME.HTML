/* JavaScript, html5, jQuery and CSS3 Study | (c) 2013 twitter@sumo_ninja_jp
*/

$.event.special.swipe.horizontalDistanceThreshold = 100;

$.event.special.swipe.verticalDistanceThreshold = 20;

var storage = localStorage;

var idDef = [ "lgme", "00" ];
var vKey = { "sign":idDef[0], "version":idDef[1], "time":"", "isDel":false };
var pKey = { "sign":idDef[0], "version":idDef[1] };

$("#p01_btn1").click( recordClicked );
$("#p01_btn2").click( recordClicked );
$("#p01_btn3").click( recordClicked );
$("#p01_btn4").click( recordClicked );
$("#p01_btn5").click( recordClicked );

$("#p02_btnc").click( clearClicked );

$( "#p01_frm1" ).submit( cancelSubmit );
$( "#p02_frm1" ).submit( cancelSubmit );
$( "#p03_frm1" ).submit( cancelSubmit );

$( "#p02" ).on( "swiperight", "#p02_cont", function( e ) {
   $.mobile.changePage( "#p01", { transition: "slide", reverse: true } );
  } );
$( "#p01" ).on( "swipeleft", "#p01_cont", function( e ) {
   $.mobile.changePage( "#p02", { transition: "slide" } );
  } );

/*
$(document).one( "pageinit", function( e ){
  showRecords();
});
*/

$( "#p02" ).on( "pagebeforeshow", function( e ){
  showRecords();
});

/*
$( "#d03" ).on( "pagebeforeshow", function( e ){
  $( "#d03_mem" ).empty();
  $( "#d03_mem" ).text( "" + "" );
});
*/

// #p01 functions

function cancelSubmit( e ){
  e.preventDefault();
  return false;
}

function recordClicked( e ) {

  var v = store( e.target.value );

//alert(v);

  if( $( "input[name='p01_chb1']" ).is( ":checked" ) && navigator.geolocation ) {
    navigator.geolocation.getCurrentPosition( 
      function( pos ) {
        addLocation( v, pos.coords.latitude, pos.coords.longitude );
      }, notifyError );
  } // end of if

  $("#p01_btns .ui-btn-active").toggleClass("ui-btn-active");
}

function clearClicked( e ) {
  clearRecords();
  showRecords();

  $("#p02_btns .ui-btn-active").toggleClass("ui-btn-active");
}

function addLocation( t, lat, lng ) {

//alert(t);

  vKey.time = t;

  var record = JSON.parse( storage.getItem( JSON.stringify( vKey ) ) );

  record = { "val":record.val, "opt":record.opt, "sub":record.sub, "lat":lat, "lng":lng };

//alert( "time : " + t + "\nval : " + record.val + "\nopt : " + record.opt + "\nsub : " + record.sub + "\nlat : " + record.lat + "\nlng : " + record.lng );

  storage.setItem( JSON.stringify(vKey), JSON.stringify(record) );
}

function store( str ) {
  var d = new Date();
  var obj = { "val":str, "opt":$( "input[name='p01_opt']:checked" ).val(), "sub":$( "input[name='p01_txt1']" ).val() };

//alert(JSON.stringify(obj));

  vKey.time = d.getTime();

//alert(JSON.stringify(vKey));

  storage.setItem( JSON.stringify(vKey), JSON.stringify(obj) );

  return vKey.time;
}

function clearRecords() {
  var k;
  var i = 0;

  while( storage.length > i ) {
    k = storage.key(i);
    if( isKey( k ) ) {
      storage.removeItem( k );
    }
    else {
      i++;
    }
  }
}

function notifyError( err ) {

}

// #p02 functions

function showRecords() {
  $( "#p02_record" ).empty();
  $( "#p02_record" ).append( updateList() );
  $( "#p02_record" ).trigger( "create" );
  $( "#p02_list" ).listview( "refresh" );
}

function updateList() {
  var result = "";
  var divider = "";
  var keys = [];
  var d = new Date(), k, v;

  if( storage.length > 0 ) {
    keys = [];
    for( var i = 0, j = 0; i < storage.length; i++ ) {
      k = storage.key(i);
      if( isKey( k ) ) {
        keys[j++] = JSON.parse( k ).time;
      }
    }
    keys.sort();

    result += "<ul id='p02_list' data-role='listview'>";
    divider = "";

    for( var i = 0; i < keys.length; i++ ){
      k = keys[keys.length-i-1];
      d.setTime(k);
      if( divider != getDisplayDateString( d ) ) {
        divider = getDisplayDateString( d );
        result += "<li data-role='list-divider'>" + divider + "</li>";
      }

      vKey.time = k;
      v = JSON.parse( storage.getItem(JSON.stringify(vKey)) );

      result += "<li><a href='#p03' onClick=\"editRecord(" + k + ")\">" + getDisplayTimeString( d ) + " " + v.val;

      if( v.opt != "None" ) {
        result += " " + v.opt;
      }
      if( v.sub.length > 0 ) {
        result += " " + v.sub;
      }
      result += "</a>";
      if( v.lat != undefined && v.lng != undefined ) {
        result += "<span class='ui-li-count'>!</span>";
      }
      result+="</li>";

    }
    result += "</ul>";
  }
//alert(result);

  return result;
}

function isKey( k ) {
  var obj = JSON.parse( k );

  return obj.sign == idDef[0] && obj.version == idDef[1];
}

// #p03 functions

function editRecord( t ) {

  vKey.time = t;
  if( ! isKey( JSON.stringify( vKey ) ) ){
    return;
  }

  $( "#p03" ).one( "pagebeforeshow", function( e ){
      initEditUI( t );
  } );
}

function initEditUI( t ){

  var getRecord;

  var record;
  var hasPos = false;
  var lat, lng;
  var d = new Date();
  d.setTime( t );

  $( "#p03_lbl1" ).text( " [" + getDisplayFullString( d ) + "]" );

  $( "#p03_txt1" ).val( getISODateString( d ) );

  record = JSON.parse( storage.getItem( JSON.stringify( vKey ) ) );

  $( "#p03_lbl2" ).text( " [" + record.val + "]" );

  $( "#p03_txt2" ).val( record.val );

  $( "#p03_lbl3" ).text( " [" + record.opt + "]" );

  $( "input[name='p03_rch1'][value='" + record.opt + "']" ).prop( "checked", true );

  $( "input[name='p03_rch1'][value!='" + record.opt + "']" ).prop( "checked", false );

  $( "input[name='p03_rch1']" ).checkboxradio( "refresh" );

  $( "#p03_lbl4" ).text( " [" + record.sub + "]" );

  $( "#p03_txt3" ).val( record.sub );

  $( "#p03_map1" ).empty();
  if( record.lat == undefined || record.lng == undefined ) {

    $( "#p03_btn1" ).button( "disable" );
  }
  else {
    hasPos = true;
    lat = record.lat;
    lng = record.lng;

    $( "#p03_btn1" ).button( "enable" );

    $( "#p03_map1" ).append( getGoogleMapImgTag( lat, lng ) );
  }

  $( "#p03_btn0" ).unbind( "click" );
  $( "#p03_btn0" ).click( function( e ) {
    if( navigator.geolocation ) {
      navigator.geolocation.getCurrentPosition( 
      function( pos ) {
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;

        $( "#p03_map1" ).empty();
        $( "#p03_map1" ).append( getGoogleMapImgTag( lat, lng ) );

        $( "#p03_btn1" ).button( "enable" );
        $( "#p03_btn1" ).button( "refresh" );

        hasPos = true;
      }, notifyError );
    } // end of if

    $("#p03_btns .ui-btn-active").toggleClass("ui-btn-active");
  } ); // end of click

  if( record.dsc != undefined ){
    $( "#p03_txa1" ).val( record.dsc );
  }
  else {
    $( "#p03_txa1" ).val( "" );
  }

  $( "#p03_btn1" ).unbind( "click" );
  $( "#p03_btn1" ).click( function( e ) {
    $( "#p03_map1" ).empty();

    $( "#p03_btn1" ).button( "disable" );
    $( "#p03_btn1" ).button( "refresh" );

    hasPos = false;

    $("#p03_btns .ui-btn-active").toggleClass("ui-btn-active");
  } ); // end of click

  $( "#p03_btn0" ).button( "refresh" );
  $( "#p03_btn1" ).button( "refresh" );

//alert( $("input[name='p03_rdo2']").parent().html());
//alert(  $( "#p03_txt1" ).parent().parent().html());

  $( "#p03_btnd" ).unbind( "click" );
  $( "#p03_btnd" ).click( function( e ){
      initDeleteConfirmUI( t );
    } );

  getRecord = function() {
    if( hasPos ){
      return {"val":$( "#p03_txt2" ).val(), 
"opt":$( "input[name='p03_rch1']:checked" ).val(), 
"sub":$( "#p03_txt3" ).val(),"lat":lat,"lng":lng};
    }
    else {
      return {"val":$( "#p03_txt2" ).val(), 
"opt":$( "input[name='p03_rch1']:checked" ).val(), 
"sub":$( "#p03_txt3" ).val()};
    }
  };

  $( "#p03_btnu" ).unbind( "click" );
  $( "#p03_btnu" ).click( function( e ){
    initUpdateConfirmUI( t, getRecord );
  } );
}

function initUpdateConfirmUI( t, getRecord ){
  var dd = getDateFromUI();
  var d = new Date();
  d.setTime( t );

  $( "#d02_msg1" ).text( "To save as new record, another date or time is needed. if you choose update description, other changes are discarded." );

  $( "#d02_btnd" ).unbind( "click" );
  $( "#d02_btnd" ).click( function( e ){
    if( $( "#p03_txa1" ).val().length > 0 ){
      addDescription( t, $( "#p03_txa1" ).val() );
    }

    $( "#d02" ).dialog( "close" );
  } );

  $( "#d02_btnc" ).unbind( "click" );
  $( "#d02_btnc" ).click( function( e ){
    $( "#d02" ).dialog( "close" );
  } );

  $( "#d02" ).one( "pagebeforeshow", function( e ){
    if( isSameISODate( d, dd ) ){
      $( "#d02_btnn" ).button( "disable" );
    }
    else{
      $( "#d02_btnn" ).button( "enable" );
    }
    $( "#d02_btnn" ).button( "refresh" );
  } );

  $( "#d02_btnn" ).unbind( "click" );
  $( "#d02_btnn" ).click( function( e ){
    var nd = getDateFromUI();
    vKey.time = d.getTime();

    if( storage.getItem( JSON.stringify( vKey ) ) == null || ( storage.getItem( JSON.stringify( vKey ) ) != null && confirm( "Record on " + getDisplayFullString( nd ) + " has already existed. Over write?" ) ) ) {

      storage.setItem( JSON.stringify( vKey ), JSON.stringify( getRecord() ) );
      if( $( "#p03_txa1" ).val().length > 0 ){
        addDescription( t, $( "#p03_txa1" ).val() );
      }

      showRecords();
    }

    $.mobile.changePage( "#p02", { transition: "pop", reverse: true } );
  } );

  $( "#d02_btnu" ).unbind( "click" );
  $( "#d02_btnu" ).click( function( e ){
    var tt = dd.getTime();

    if( ! isSameISODate( d, dd ) ){
      deleteRecord( t );
      t = tt;
    }

//alert(JSON.stringify( getRecord() ) );

    vKey.time = t;
    storage.setItem( JSON.stringify( vKey ), JSON.stringify( getRecord() ) );

    if( $( "#p03_txa1" ).val().length > 0 ){
      addDescription( t, $( "#p03_txa1" ).val() );
    }
    showRecords();

    $.mobile.changePage( "#p02", { transition: "pop", reverse: true } );
  } );

  $.mobile.changePage( "#d02", { role: "dialog", transition: "pop" } );
}

function initDeleteConfirmUI( t ){
  var d = new Date();
  d.setTime( t );

  $( "#d01_msg1" ).text( "Are you sure, you would like to delete this record on " + getDisplayDateString( d ) + " " + getDisplayTimeString( d ) + " ?" );

  $( "#d01_btno" ).unbind( "click" );
  $( "#d01_btno" ).click( function( e ){
    deleteRecord( t );
    $.mobile.changePage( "#p02", { transition: "pop", reverse: true } );
  } );

  $( "#d01_btnc" ).unbind( "click" );
  $( "#d01_btnc" ).click( function( e ){
    $( "#d01" ).dialog( "close" );
  } );

  $.mobile.changePage( "#d01", { role: "dialog", transition: "pop" } );
}

function getGoogleMapImgTag( lat, lng ){
  var result = "<img src=\"http://maps.googleapis.com/maps/api/staticmap?center=" + lat + "," + lng;

  result += "&zoom=12&size=250x250&markers=color:blue%7Clabel:G%7C" + lat + "," + lng + "&sensor=false\" />"

  return result;
}

function deleteRecord( t ) {
  vKey.time = t;
  var k = JSON.stringify( vKey );
  if( isKey( k ) ) {
    storage.removeItem( k );
    showRecords();
  }
}

function isSameISODate( d1, d2 ){
  return getISODateString( d1 ) == getISODateString( d2 );
}

function getDateFromUI(){
  var d = new Date();
  var str = $( "input[name='p03_txt1']" ).val();
  d.setTime( Date.parse( str + ":00+09:00") );

//alert(str+", "+getDisplayDateString(d)+" "+getDisplayTimeString(d));

  return d;
}

function addDescription( t, desc ){
  vKey.time = t;
  var record = JSON.parse( storage.getItem( JSON.stringify( vKey ) ) );

//alert("before: "+JSON.stringify(record));

  if( record.lat == undefined || record.lng == undefined ) {
    record = { "val":record.val, "opt":record.opt, "sub":record.sub, "dsc":desc };
  }
  else {
    record = { "val":record.val, "opt":record.opt, "sub":record.sub, "lat":record.lat, "lng":record.lng, "dsc":desc };
  }

//alert("after: "+JSON.stringify(record) );

  storage.setItem( JSON.stringify(vKey), JSON.stringify(record) );
}

// utility functions

function getDisplayFullString( d ) {
  return getDisplayDateString( d ) + " " + getDisplayTimeString( d ) + " " + getMilisecondString( d );
}


function getDisplayDateString( d ) {
  return d.getFullYear() + "/" + pad( d.getMonth()+1 ) + "/" + pad( d.getDate() );
}

function getDisplayTimeString( d ) {
  return pad( d.getHours() ) + ":" + pad( d.getMinutes() ) + ":" + pad( d.getSeconds() );
}

function getISODateString( d ) {
  return d.getFullYear() + "-" + pad( d.getMonth()+1 ) + "-" + pad( d.getDate() ) + "T" + pad( d.getHours() ) + ":" + pad( d.getMinutes() );
}

function pad( num ) {
  return num < 10 ? "0" + num : num;
}

function getMilisecondString( d ){
  return String( (d.getMilliseconds()/1000).toFixed(3) ).slice( 2, 5 );
}

function c( o ){
  alert(Object.prototype.toString.call(o));
}
