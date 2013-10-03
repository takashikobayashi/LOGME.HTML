
/* LOG ME | JavaScript, html5, jQuery and CSS3 Study | (c) 2013 twitter@sumo_ninja_jp
*/

$.event.special.swipe.horizontalDistanceThreshold = 100;
$.event.special.swipe.verticalDistanceThreshold = 20;

var storage = localStorage;

var idDef = [ "lgme", "00" ];
var vKey = { "sign":idDef[0], "version":idDef[1], "time":"", "isDel":false };

var idKey = [ "#p04_txa1", "p04_rch1", "p04_rch2", "p04_rch3", "p04_flp1", "#p04_txa2" ];
var sKey = { "sign":idDef[0], "version":idDef[1], "id":"" };

function isKey( k ) {
  var obj = JSON.parse( k );

  return obj.sign == idDef[0] && obj.version == idDef[1] && obj.time != undefined;
}

function store( t, getRecord ) {
  vKey.time = t;

  storage.setItem( JSON.stringify( vKey ), JSON.stringify( getRecord() ) );
//alert(JSON.stringify(vKey));
//alert(JSON.stringify(getRecord()));
}


$(document).one( "pageinit", function( e ){
//alert("init");
  initApp();

  restoreSetting();
  initSettingUI();

  initMainUI();
  initEditUI();
} );

function initApp() {
  $( "#p01_sel1" ).change( function( e ) {
//alert(e.target.value);
    addToSubtitle( e.target.value, "#p01_txt1" );
  } );

  $( "#p03_sel1" ).change( function( e ) {
//alert(e.target.value);
    if( e.target.value.length > 0 ) {
      $( "#p03_txt2" ).val( e.target.value );
    }
  } );

  $( "#p03_sel2" ).change( function( e ) {
//alert(e.target.value);
    addToSubtitle( e.target.value, "#p03_txt3" );
  } );

  $("#p02_btnc").click( clearClicked );

  var cancelSubmit = function( e ){
    e.preventDefault();
    return false;
  }

  $( "#p01_frm1" ).submit( cancelSubmit );
  $( "#p02_frm1" ).submit( cancelSubmit );
  $( "#p03_frm1" ).submit( cancelSubmit );
  $( "#p04_frm1" ).submit( cancelSubmit );

  $( "#p02" ).on( "swiperight", "#p02_cont", function( e ) {
    $.mobile.changePage( "#p01", { transition: "slide", reverse: true } );
  } );
  $( "#p01" ).on( "swipeleft", "#p01_cont", function( e ) {
    $.mobile.changePage( "#p02", { transition: "slide" } );
  } );
}


// #p01 functions

function initMainUI() {
  var i;
  var result = "";
  var elms;
  var val = $( idKey[0] ).val();

  if( val != null && val.length > 0 ) {
    elms = toTrimedStringArray( val );

    for( i = 0; i < elms.length; i++ ) {
      result += "<input type=\"button\" name=\"p01_btn" + i + "\" value=\"" + removeTag( elms[i] ) + "\" id=\"p01_btn" + i + "\" data-corners=\"false\" form=\"p01_frm1\"/>";
    }

    $( "#p01_btns" ).empty();
    $( "#p01_btns" ).append( result );
    $( "#p01_btns" ).trigger( "create" );

    for( i = 0; i < elms.length; i++ ) {
      $( "#p01_btn" + i ).click( recordClicked );
    }
  }

  initSelectUI( idKey[5], "#p01_sel1" );
}

function recordClicked( e ) {
  var d = new Date();
  var getRecord = function() {
    return { "val":e.target.value, "opt":$( "input[name='p01_opt']:checked" ).val(), "sub":$( "input[name='p01_txt1']" ).val() };
  }

  store( d.getTime(), getRecord );

  if( $( "input[name='p01_chb1']" ).is( ":checked" ) && navigator.geolocation ) {
    navigator.geolocation.getCurrentPosition( function( pos ) {
      addLocation( d.getTime(), pos.coords.latitude, pos.coords.longitude );
    }, notifyError );
  } // end of if

  postRecord();

  $("#p01_btns .ui-btn-active").toggleClass("ui-btn-active");
}

function addLocation( t, lat, lng ) {
  vKey.time = t;
  var record = JSON.parse( storage.getItem( JSON.stringify( vKey ) ) );

  var getRecord = function() {
    return { "val":record.val, "opt":record.opt, "sub":record.sub, "lat":lat, "lng":lng };
  }

  store( t, getRecord );
}

function notifyError( err ) {
}

function addToSubtitle( str, target ) {
//alert(str);
  var sub = $( target ).val();
  if( str.length > 0 ) {
    if( sub != null && sub.length > 0 ) {
      str = " " + str;
    }

    $( target ).val( sub + str );
  }
}


// #p02 functions

$( "#p02" ).on( "pagebeforeshow", function( e ){
  showRecords();
});

function showRecords() {
  $( "#p02_record" ).empty();
  $( "#p02_record" ).append( updateList() );
  $( "#p02_record" ).trigger( "create" );
  $( "#p02_list" ).listview( "refresh" );

  updateButtons();
}

function toggleList() {
  var mode = getModeValueFromUI();
//alert("cur mode: "+mode);

  mode = ++mode % 4;
  setModeValueToUI( mode );
//alert("new mode: "+mode);

  showRecords();
}

function updateButtons() {
  var mode = getModeValueFromUI();

  if( ( mode + 1 ) % 4 >= 2 ) {
    $( "#p02_lblt" ).text( "On" );
  }
  else {
    $( "#p02_lblt" ).text( "Off" );
  }

  if( ( ( mode + 1 ) % 4 ) % 2 == 1 ) {
    $( "#p02_btnt" ).buttonMarkup({ icon: "arrow-d" });
  }
  else {
    $( "#p02_btnt" ).buttonMarkup({ icon: "arrow-u" });
  }
  $( "#p02_btnt" ).buttonMarkup( "refresh" );

  if( mode >= 2 ) {
    $( "#p02_btnc" ).button( "disable" );
  }
  else {
    $( "#p02_btnc" ).button( "enable" );
  }
  $( "#p02_btnc" ).button( "refresh" );
}

function updateList() {
  var i;
  var result = "";
  var divider = "";
  var keys;
  var d = new Date(), k, v;
  var mode = getModeValueFromUI();

  if( storage.length > 0 ) {
    keys = [];
    for( var i = 0; i < storage.length; i++ ) {
      k = storage.key(i);
      if( isKey( k ) ) {
        keys.push( JSON.parse( k ).time );
      }
    }
    keys.sort();

    if( mode >= 2 ) {
      result = "<ul id=\"p02_list\" data-role=\"listview\" data-filter=\"true\">";
    }
    else {
      result = "<ul id=\"p02_list\" data-role=\"listview\" data-filter=\"false\">";
    }
    divider = "";

    for( i = 0; i < keys.length; i++ ){
      if( mode % 2 == 1 ) {
        k = keys[keys.length-i-1];
      }
      else {
        k = keys[i];
      }
      d.setTime(k);
      if( divider != getDisplayDateString( d ) ) {
        divider = getDisplayDateString( d );
        result += "<li data-role=\"list-divider\">" + divider + "</li>";
      }

      vKey.time = k;
      v = JSON.parse( storage.getItem(JSON.stringify(vKey)) );

      result += "<li data-filtertext=\"" + divider + " " + getDisplayTimeString( d ) +  " " + v.val + " " + v.sub + "\"><a href=\"#p03\" onClick=\"editRecord(" + k + ")\">" + getDisplayTimeString( d ) + " " + v.val;
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

function clearClicked( e ) {
  initDeleteAllConfirmUI();
  $("#p02_btns .ui-btn-active").toggleClass("ui-btn-active");
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


// #p03 functions

function editRecord( t ) {
  vKey.time = t;
  if( storage.getItem( JSON.stringify( vKey ) ) == null ){
    $( "#p03" ).one( "pagebeforeshow", function( e ){
      e.preventDefault();
      alert( "No data in storage." );
      $.mobile.changePage( "#p02" );
    } );
    return false;
  }

  $( "#p03" ).one( "pagebeforeshow", function( e ){
    readyForEdit( t );
  } );
}

function readyForEdit( t ){
  var getRecord;
  var record;
  var hasPos = false;
  var lat, lng;
  var d = new Date();
  d.setTime( t );

  $( "#p03_lbl1" ).text( " [" + getDisplayFullString( d ) + "]" );
  $( "#p03_txt1" ).val( getISODateString( d ) );

  vKey.time = t;
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
    $( "#p03_map1" ).append( getGoogleMapImgTag( lat, lng, getZoomValueFromUI() ) );
  }

  $( "#p03_btn0" ).unbind( "click" );
  $( "#p03_btn0" ).click( function( e ) {
    if( navigator.geolocation ) {
      navigator.geolocation.getCurrentPosition( function( pos ) {
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;

        $( "#p03_map1" ).empty();
        $( "#p03_map1" ).append( getGoogleMapImgTag( lat, lng, getZoomValueFromUI() ) );

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

function initEditUI() {
  initSelectUI( idKey[0], "#p03_sel1" );
  initSelectUI( idKey[5], "#p03_sel2" );
}

function initSelectUI( source, target ) {
  var elms, i;
  var result = "<option value=\"\" selected=\"selected\"></option>";
  var val = $( source ).val();

  if( val != null && val.length > 0 ) {
    elms = toTrimedStringArray( val );

    for( i = 0; i < elms.length; i++ ) {
      result += "<option value=\"" + elms[i] + "\">" + removeTag( elms[i] ) + "</option>";
    }

    $( target ).empty();
    $( target ).append( result );
    $( target ).trigger( "create" );
  }
}


// p04 functions

function initSettingUI() {
  $( "#p04_btno" ).click( function( e ){
    initMainUI();
    initEditUI();
    saveSetting();

    $.mobile.changePage( "#p01" );
  } );

  $( "#p04_btnc" ).click( function( e ){
    $.mobile.changePage( "#p01" );

    restoreSetting();
  } );
}

function restoreSetting() {
  sKey.id = idKey[0];
  var val = storage.getItem( JSON.stringify( sKey ) );
  if( val != null ) {
    $( idKey[0] ).val( val );
  }

  sKey.id = idKey[1];
  val = storage.getItem( JSON.stringify( sKey ) );
  if( val != null ) {
    $( "input[name='" + idKey[1] + "'][value='" + val + "']" ).prop( "checked", true );
    $( "input[name='" + idKey[1] + "'][value!='" + val + "']" ).prop( "checked", false );
  }

  sKey.id = idKey[2];
  val = storage.getItem( JSON.stringify( sKey ) );
  if( val != null ) {
    $( "input[name='" + idKey[2] + "'][value='" + val + "']" ).prop( "checked", true );
    $( "input[name='" + idKey[2] + "'][value!='" + val + "']" ).prop( "checked", false );
  }

  sKey.id = idKey[3];
  val = storage.getItem( JSON.stringify( sKey ) );
  if( val != null ) {
    $( "input[name='" + idKey[3] + "'][value='" + val + "']" ).prop( "checked", true );
    $( "input[name='" + idKey[3] + "'][value!='" + val + "']" ).prop( "checked", false );
  }

  sKey.id = idKey[4];
  val = storage.getItem( JSON.stringify( sKey ) );
  if( val != null ) {
    $( "select[name='" + idKey[4] + "'] option[value='" + val + "']" ).prop( "selected", true );
    $( "select[name='" + idKey[4] + "'] option[value!='" + val + "']" ).prop( "selected", false );
  }

  sKey.id = idKey[5];
  var val = storage.getItem( JSON.stringify( sKey ) );
  if( val != null ) {
    $( idKey[5] ).val( val );
  }

  $( "#p04" ).one( "pagebeforeshow", function( e ){
    $( "input[name='" + idKey[1] + "']" ).checkboxradio( "refresh" );

    $( "input[name='" + idKey[2] + "']" ).checkboxradio( "refresh" );

    $( "input[name='" + idKey[3] + "']" ).checkboxradio( "refresh" );

    $( "select[name='" + idKey[4] + "']" ).slider( "refresh" );
  } );
}

function saveSetting() {
  sKey.id = idKey[0];
  var val = $( idKey[0] ).val();
  if( val.length > 0 ) {
    storage.setItem( JSON.stringify( sKey ), val );
  }
  else {
    storage.removeItem( JSON.stringify( sKey ) );
  }

  sKey.id = idKey[1];
  val = getZoomValueFromUI();
  storage.setItem( JSON.stringify( sKey ), val );

  sKey.id = idKey[2];
  val = $( "input[name='" + idKey[2] + "']:checked" ).val();
  storage.setItem( JSON.stringify( sKey ), val );

  sKey.id = idKey[3];
  val = $( "input[name='" + idKey[3] + "']:checked" ).val();
  storage.setItem( JSON.stringify( sKey ), val );

  sKey.id = idKey[4];
  val = $( "select[name='" + idKey[4] + "'] option:selected" ).val();
  storage.setItem( JSON.stringify( sKey ), val );

  sKey.id = idKey[5];
  val = $( idKey[5] ).val();
  if( val.length > 0 ) {
    storage.setItem( JSON.stringify( sKey ), val );
  }
  else {
    storage.removeItem( JSON.stringify( sKey ) );
  }
}

function postRecord() {
  var val = $( "input[name='" + idKey[2] + "']:checked" ).val();
//alert( val );
  switch( val ) {
    case "on":
      $( "#p01_chb1" ).prop( "checked", true );
      break;
    case "off":
      $( "#p01_chb1" ).prop( "checked", false );
      break;
    default:
      break;
  }
  $( "#p01_chb1" ).checkboxradio( "refresh" );
}

function getZoomValueFromUI() {
  return $( "input[name='" + idKey[1] + "']:checked" ).val();
}

function getModeValueFromUI() {
//alert("getModeValueFromUI");
//alert("radio: "+$( "input[name='" + idKey[3] + "']:checked" ).val());
//alert("flip: "+$( "select[name='" + idKey[4] + "'] option:selected" ).val());

  return Number( $( "input[name='" + idKey[3] + "']:checked" ).val() ) + Number( $( "select[name='" + idKey[4] + "'] option:selected" ).val() );
}

function setModeValueToUI( mode ) {
  var val = mode % 2;
//alert("radio: "+val);
  $( "input[name='" + idKey[3] + "'][value='" + val + "']" ).prop( "checked", true );
  $( "input[name='" + idKey[3] + "'][value!='" + val + "']" ).prop( "checked", false );

  val = mode - ( mode % 2 );
//alert("flip: "+val);
  $( "select[name='" + idKey[4] + "'] option[value='" + val + "']" ).prop( "selected", true );
  $( "select[name='" + idKey[4] + "'] option[value!='" + val + "']" ).prop( "selected", false );

  $( "#p04" ).one( "pagebeforeshow", function( e ){
    $( "input[name='" + idKey[3] + "']" ).checkboxradio( "refresh" );

    $( "select[name='" + idKey[4] + "']" ).slider( "refresh" );
  } );
}


// d01 functions

function initDeleteConfirmUI( t ){
  var d = new Date();
  d.setTime( t );

  $( "#d01_hdr1" ).text( "Delete Record" );

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

function deleteRecord( t ) {
  vKey.time = t;
  var k = JSON.stringify( vKey );
  if( isKey( k ) ) {
    storage.removeItem( k );
  }
}

function initDeleteAllConfirmUI(){

  $( "#d01_hdr1" ).text( "Delete All" );

  $( "#d01_msg1" ).text( "Are you sure, you would like to delete all records ?" );

  $( "#d01_btno" ).unbind( "click" );
  $( "#d01_btno" ).click( function( e ){
    clearRecords();
    $( "#d01" ).dialog( "close" );
  } );

  $( "#d01_btnc" ).unbind( "click" );
  $( "#d01_btnc" ).click( function( e ){
    $( "#d01" ).dialog( "close" );
  } );

  $.mobile.changePage( "#d01", { role: "dialog", transition: "pop" } );
}


// d02 functions

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
      $( "#d02_btnn" ).unbind( "click" );

      $( "#d02_btnu" ).unbind( "click" );
      $( "#d02_btnu" ).click( function( e ){
        restore( t, getRecord );
        $.mobile.changePage( "#p02", { transition: "pop", reverse: true } );
      } );
    }
    else{
      $( "#d02_btnn" ).button( "enable" );
      $( "#d02_btnn" ).unbind( "click" );
      $( "#d02_btnn" ).click( function( e ){
        if( isOverwrite( dd.getTime() ) ) {
          restore( dd.getTime(), getRecord );
          $.mobile.changePage( "#p02", { transition: "pop", reverse: true } );
        }
        else {
          $( "#d02" ).dialog( "close" );
        }
      } );

      $( "#d02_btnu" ).unbind( "click" );
      $( "#d02_btnu" ).click( function( e ){
        if( isOverwrite( dd.getTime() ) ) {
          restore( dd.getTime(), getRecord );
          deleteRecord( t );
          $.mobile.changePage( "#p02", { transition: "pop", reverse: true } );
        }
        else {
          $( "#d02" ).dialog( "close" );
        }
      } );
    }
    $( "#d02_btnn" ).button( "refresh" );
  } );

  $.mobile.changePage( "#d02", { role: "dialog", transition: "pop" } );
}

function isOverwrite( t ) {
  var d = new Date();
  d.setTime( t );
  vKey.time = t;

  return storage.getItem( JSON.stringify( vKey ) ) == null || ( storage.getItem( JSON.stringify( vKey ) ) != null && confirm( "Record on " + getDisplayFullString( d ) + " has already existed. Over write?" ) );
}

function restore( t, getRecord ) {
  store( t, getRecord );

  if( $( "#p03_txa1" ).val().length > 0 ){
    addDescription( t, $( "#p03_txa1" ).val() );
  }
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

  var getRecord = function() {
    if( record.lat == undefined || record.lng == undefined ) {
      return { "val":record.val, "opt":record.opt, "sub":record.sub, "dsc":desc };
    }
    else {
      return { "val":record.val, "opt":record.opt, "sub":record.sub, "lat":record.lat, "lng":record.lng, "dsc":desc };
    }
  }

  store( t, getRecord );
}


// d03 functions

/*
$( "#d03" ).on( "pagebeforeshow", function( e ){
  $( "#d03_mem" ).empty();
  $( "#d03_mem" ).text( "" + "" );
});
*/


// utility functions

function removeTag( str ) {
  return str.replace( /</g, "&lt" ).replace( />/g, "&gt" );
}

function toTrimedStringArray( str ) {
  var ret = [];
  var prm = str.trim().split( "\n" );

  for( var i = 0; i < prm.length; i++ ) {
    if( prm[i].trim().length > 0 ) {
      ret.push( prm[i].trim() );
    }
  }

  return ret;
}

function getGoogleMapImgTag( lat, lng, zoom ){
  var result = "<img src=\"http://maps.googleapis.com/maps/api/staticmap?center=" + lat + "," + lng;

  result += "&zoom=" + zoom + "&size=250x250&markers=color:blue%7Clabel:G%7C" + lat + "," + lng + "&sensor=false\" />"

  return result;
}

function isSameISODate( d1, d2 ){
  return getISODateString( d1 ) == getISODateString( d2 );
}

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
