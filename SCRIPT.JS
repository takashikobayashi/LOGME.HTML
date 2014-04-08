/* LOG ME | JavaScript, html5, jQuery and CSS3 Study | (c) 2013-2014 twitter@sumo_ninja_jp
*/

(function( exports ){

var LOGME = {};

$.event.special.swipe.horizontalDistanceThreshold = 100;
$.event.special.swipe.verticalDistanceThreshold = 20;

var storage = localStorage;
var vals, subs;
var settings;
var getPassword;
var isDecrypting, isEncrypting;

var appVer = "0.96";
var hashOp = { "outputLength":256 };
var idSgn = "lgme";
var idVer = [ "00", "01" ];

var vKey = { "sign":idSgn, "version":idVer[0], "time":"", "isDel":false };

var idKey = [ "#p04_txa1", "p04_rch1", "p04_rch2", "p04_rch3", "p04_flp1", "#p04_txa2", "p04_rch4", "p04_rch5", "#p04_chb1", "#p04_chb2" ];
var sKey = { "sign":idSgn, "version":idVer[0], "id":"" };


function isKey( k ) {
  var key = JSON.parse( k );
  var ret = ( key.sign == idSgn && idVer.indexOf( key.version ) != -1 && key.time != undefined );

/*
  if( ret && ! confirm( k ) ){
    storage.removeItem( k );
    return false;
  }
*/
  return ret;
}

function createKey( t ) {
  vKey.time = t;
  vKey.version = idVer[isEncrypting()?1:0];

  return JSON.stringify( vKey );
}

function store( k, getRecord ) {
  var v = JSON.stringify( getRecord() );
  var key = JSON.parse( k );
  var val;
  var p;

  if( key.version == idVer[1] && isEncrypting() ) {
    p = getPassword();
    v = CryptoJS.AES.encrypt( v, p );
    val = {"val":v.toString(),"slt":v.salt.toString(),"hsh":getHash( p + v.salt.toString() )};
    v = JSON.stringify( val );
  }

  storage.setItem( k, v );
//alert(k);
//alert(v);
}

function extract( k ) {
  var v = storage.getItem( k );
  var key, obj;
  var p;

  if( v == null ) {
    return v;
  }

  key = JSON.parse( k );
  if( key.version === idVer[1] ) {
    if( ! isDecrypting() ) {
      v = null;
    }
    else {
      p = getPassword();
      if( isDecryptable( k, p ) ) {
        obj = JSON.parse( v );
        v = CryptoJS.AES.decrypt( obj.val, p );
        if( v != null){
          v = v.toString( CryptoJS.enc.Utf8 );
        }
      }
      else {
        v = null;
      }
    }
  }

  return v;
}

function isDecryptable( k, p ) {
  var obj = JSON.parse( storage.getItem( k ) );
  return ( obj.hsh === getHash( p + obj.slt ) );
}

function getHash( src ) {
  var hash = CryptoJS.SHA3( src, hashOp );
  return hash.toString();
}

$(document).one( "pagecreate", function( e ){
//  checkUpdateReady();
  initNameSpace();
  initApp();

  initSettingUI();
  initMainUI();
} );

function initNameSpace() {
  if( typeof exports.LOGME === "undefined" ) {
    exports.LOGME = LOGME;
    LOGME.handler = {};
  }
  else {
    LOGME = exports.LOGME;
    if( typeof LOGME.handler === "undefined" ) {
      LOGME.handler = {};
    }
  }

  LOGME.handler.editRecord = editRecord;
  LOGME.handler.decryptRecord = decryptRecord;
  LOGME.handler.toggleList = toggleList;
}

function initApp() {
//alert("initApp: begin");

  getPassword = getMasterPassword;
  isDecrypting = getIsDecryptingFromUI;
  isEncrypting = getIsEncryptingFromUI;

  // Main #1
  $( "#p01" ).on( "swipeleft", "#p01_cont", function( e ) {
    $.mobile.changePage( "#p02", { transition: "slide" } );
  } );

  $( "#p01_sel1" ).change( function( e ) {
//alert(e.target.value);
    addToSubtitle( e.target.value, "#p01_txt1" );
  } );

  $( "#p01_frm1" ).submit( cancelSubmit );

  // List #2
  $( "#p02" ).on( "swiperight", "#p02_cont", function( e ) {
    $.mobile.changePage( "#p01", { transition: "slide", reverse: true } );
  } );

  $( "#p02" ).on( "pagebeforeshow", function( e ){
    showRecords();
});

  $("#p02_btnc").click( function( e ) {
    deleteAllClicked();
  } );

  $( "#p02_frm1" ).submit( cancelSubmit );

  // Edit #3
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

  $( "#p03_frm1" ).submit( cancelSubmit );

  // Setting #4
  $( "#p04_btnb" ).click( function( e ){
    if( isSettingChanged() ) {
      confirmSaveSetting();
    }
    else {
      $.mobile.changePage( "#p01", { transition: "slide" } );
    }
  } );

  $( "#p04_frm1" ).submit( cancelSubmit );

  // About #5
  $( "#p05_lblv" ).text( appVer );

//alert("initApp: end");
}

function checkUpdateReady() {
//alert("checkUpdateReady: begin");
  var cache = window.applicationCache;
  var location = window.location;
  var navigator = window.navigator;

  cache.addEventListener( "updateready", function() {
    if( confirm( "LOG ME: module updated.\nWould you like to apply now?" ) ) {
      cache.swapCache();
      location.reload();
    }
  } );

  if( navigator.onLine ) {
    cache.update();
  }
//alert("checkUpdateReady: end");
}

function cancelSubmit( e ) {
  e.stopPropagation();
  e.preventDefault();
  return false;
}

// #p01 functions

function initMainUI() {
//alert("initMainUI: begin");
  var i;
  var result = "";
  var elms;
  var val = $( idKey[0] ).val();

  if( val != null && val.length > 0 ) {
    elms = toTrimedStringArray( val );

/*
0: #p04_txa1
2: p04_rch2
8: #p04_chb1
9: #p04_chb2
*/

    if( $( idKey[8] ).prop( "checked" ) || $( idKey[9] ).prop( "checked" ) ) {
      $( "#p01_btnl" ).toggleClass( "ui-icon-bars", false );
      $( "#p01_btnl" ).toggleClass( "ui-icon-lock", true );
    }
    else {
      $( "#p01_btnl" ).toggleClass( "ui-icon-bars", true );
      $( "#p01_btnl" ).toggleClass( "ui-icon-lock", false );
    }

    for( i = 0; i < elms.length; i++ ) {
      result += "<input type=\"button\" name=\"p01_btn" + i + "\" value=\"" + removeTag( elms[i] ) + "\" id=\"p01_btn" + i + "\" data-corners=\"false\" form=\"p01_frm1\"/>";
    }

    $( "#p01_btns" ).empty();
    $( "#p01_btns" ).append( result );
    $( "#p01_btns" ).trigger( "create" );

    for( i = 0; i < elms.length; i++ ) {
      $( "#p01_btn" + i ).click( function( e ) {
        var d = new Date();
        var t = d.getTime();

        recordClicked( t, e.target.value );
      } );
    }
  }

  val = $( "input[name='" + idKey[2] + "']:checked" ).val();

  switch( val ) {
  case "on":
    $( "#p01_chb1" ).prop( "checked", true );
    break;
  case "off":
    $( "#p01_chb1" ).prop( "checked", false );
    break;
  default:
    ;// nothing to do.
  }
  $( "#p01_chb1" ).checkboxradio( "refresh" );

  initMenus();

//alert("initMainUI: end");
}

function initMenus() {
//alert("initMenus: begin");
  var i;
  var obj, k, t;
  vals = [];
  subs = [];
  for( i = 0; i < storage.length; i++ ) {
    k = storage.key( i );
    if( ! isKey( k ) ) {
      continue;
    }
    obj = JSON.parse( extract( k ) );
    if( obj == null ) {
      continue;
    }

    t = JSON.parse( k ).time;

    addTitleArray( t, obj.val );
    addSubArray( t, obj.sub );
  }
  updateTitleMenu();
  updateSubMenu();

//alert("initMenus: end");
}

function updateMenus( t, val, sub ) {
  addTitleArray( t, val );
  addSubArray( t, sub );

  updateTitleMenu();
  updateSubMenu();
}

function addTitleArray( t, val ) {
  var i;
  for( i = 0; i < vals.length; i++ ) {
    if( vals[i].val == val ) {
      if( t > vals[i].time ) {
        vals[i].time = t;
      }
      ++( vals[i].num );
      break;
    }
  }

  if( i >= vals.length ) {
    vals.push( {"val":val,"time":t,"num":1} );
  }
}

function addSubArray( t, sub ) {
  var i;
  if( sub == "" ) {
    return;
  }
  for( i = 0; i < subs.length; i++ ) {
    if( subs[i].sub == sub ) {
      if( t > subs[i].time ) {
        subs[i].time = t;
      }
      ++( subs[i].num );
      break;
    }
  }

  if( i >= subs.length ) {
    subs.push( {"sub":sub,"time":t,"num":1} );
  }
}

function updateTitleMenu() {
  var i;
  var vala = [];

  vals.sort( function( a, b ) {
    // reverse sort z -> a
    return b.num - a.num;
  } );

  for( i = 0; i < vals.length; i++ ) {
    vala.push( vals[i].val );
  }
//alert( vala + i );
  initSelectUI( idKey[0], "#p03_sel1", vala );
}

function updateSubMenu() {
  var i;
  var suba = [];

  subs.sort( function( a, b ) {
    // reverse sort z -> a
    return b.time - a.time;
  } );

  for( i = 0; i < subs.length; i++ ) {
    suba.push( subs[i].sub );
  }
//alert( suba + i );

  initSelectUI( idKey[5], "#p01_sel1", suba );
  initSelectUI( idKey[5], "#p03_sel2", suba );
}

function recordClicked( t, val ) {
  var getRecord = function() {
    return { "val":val, "opt":$( "input[name='p01_opt']:checked" ).val(), "sub":$( "input[name='p01_txt1']" ).val() };
  }
  var obj;
  var k = createKey( t );

  store( k, getRecord );

  if( $( "input[name='p01_chb1']" ).is( ":checked" ) && navigator.geolocation ) {
    navigator.geolocation.getCurrentPosition( function( pos ) {
      addLocation( k, pos.coords.latitude, pos.coords.longitude );
    }, notifyError );
  } // end of if

  postRecord();

  obj = JSON.parse( extract( k ) );

//alert(JSON.stringify(obj));
  updateMenus( ( JSON.parse( k ) ).time, obj.val, obj.sub );

  $("#p01_btns .ui-btn-active").toggleClass("ui-btn-active");
}

function addLocation( k, lat, lng ) {
  var record = JSON.parse( extract( k ) );

  var getRecord = function() {
    return { "val":record.val, "opt":record.opt, "sub":record.sub, "lat":lat, "lng":lng };
  }

  store( k, getRecord );
}

function notifyError( err ) {
}

function addToSubtitle( str, target ) {
  var sub = $( target ).val();
  if( str.length > 0 ) {
    if( sub != null && sub.length > 0 ) {
      str = " " + str;
    }

    $( target ).val( sub + str );
  }
}


// #p02 functions

/* mode
0: 00: off, az
1: 01: off, za
2: 10: on, az
3: 11: on, za
*/

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
  var next = ( mode + 1 ) % 4;

  if( next >= 2 ) {
    $( "#p02_lblt" ).text( "On" );
  }
  else {
    $( "#p02_lblt" ).text( "Off" );
  }

  if( next % 2 == 1 ) {
    $( "#p02_btnt" ).toggleClass( "ui-icon-carat-u", false );
    $( "#p02_btnt" ).toggleClass( "ui-icon-carat-d", true );
  }
  else {
    $( "#p02_btnt" ).toggleClass( "ui-icon-carat-u", true );
    $( "#p02_btnt" ).toggleClass( "ui-icon-carat-d", false );
  }

  if( mode >= 2 ) {
    $( "#p02_btnc" ).button( "disable" );
  }
  else {
    $( "#p02_btnc" ).button( "enable" );
  }
  $( "#p02_btnc" ).button( "refresh" );
}

function updateList() {
//alert("updateList: begin, mode: "+getModeValueFromUI());
  var i;
  var ret = "";
  var divider = "";
  var fltrTxt, funcName, dispStr;
  var keys, key, k;
  var obj;
  var d = new Date();
  var mode = getModeValueFromUI();

  if( storage.length <= 0 ) {
    return ret;
  }

  keys = [];
  for( i = 0; i < storage.length; i++ ) {
    k = storage.key( i );
    if( isKey( k ) ) {
      keys.push( JSON.parse( k ) );
    }
  }
  keys.sort( function( a, b ) {
    return a.time - b.time;
  } );

  ret = "<ul id=\"p02_list\" data-role=\"listview\" data-filter=\"" + (mode >= 2) + "\">";
  divider = "";

  for( i = 0; i < keys.length; i++ ){
    if( mode % 2 == 1 ) {
      key = keys[keys.length-i-1];
    }
    else {
      key = keys[i];
    }

    d.setTime( key.time );
    if( divider != getDisplayDateString( d ) ) {
      divider = getDisplayDateString( d );
      ret += "<li data-role=\"list-divider\">" + divider + "</li>";
    }

    k = JSON.stringify( key );
    obj = JSON.parse( extract( k ) );

    if( obj == null ) {
      fltrTxt = divider + " " + getDisplayTimeString( d );
      funcName = "decryptRecord";
      dispStr = getDisplayTimeString( d ) + "<span class='ui-li-count'>?</span>";
    }
    else {
      fltrTxt = divider + " " + getDisplayTimeString( d ) +  " " + obj.val + " " + obj.sub;
      funcName = "editRecord";
      dispStr = getDisplayTimeString( d ) + " " + obj.val;
    }
    ret += "<li data-filtertext='" + fltrTxt + "'><a href='#p03' onClick=\"LOGME.handler." + funcName + "(" + key.time + ",'" + key.version + "')\">" + dispStr;

    if( obj != null ) {
      if( obj.opt != "None" ) {
        ret += " " + obj.opt;
      }
      if( obj.sub.length > 0 ) {
        ret += " " + obj.sub;
      }
      if( obj.lat != undefined && obj.lng != undefined ) {
        ret += "<span class='ui-li-count'>!</span>";
      }
    }
    ret += "</a></li>";
  }
  ret += "</ul>";

//alert("updateList: end, return: "+ret);
  return ret;
}

function deleteAllClicked() {
  var msg = "Are you sure, you would like to delete all records ?";

  if( confirm( msg ) ){
    deleteAllRecords();
    showRecords();
    initMenus();
  }

  $("#p02_btns .ui-btn-active").toggleClass("ui-btn-active");
}

function deleteAllRecords() {
//alert("deleteAllRecords: begin");
  var k;
  var ks = [];
  var i;

  for( i = 0; i < storage.length; i++ ) {
    k = storage.key( i );
    if( isKey( k ) ) {
      ks.push( k );
    }
  }
  for( i = 0; i < ks.length; i++ ) {
    storage.removeItem( ks[ i ] );
  }
//alert("deleteAllRecords: end");
}


// #p03 functions

function decryptRecord( t, v ){
//alert("decryptRecord: begin");
  vKey.time = t;
  vKey.version = v;
  var k = JSON.stringify( vKey );

  var p = checkPassword( k );

  if( p == null ) {
    $( "body" ).one( "pagecontainerbeforetransition", function( e, ui ) {
      e.stopPropagation();
      e.preventDefault();
      $.mobile.changePage( "#p02" );
      return false;
    } );
  }
  else {
    $( "body" ).one( "pagecontainerbeforeshow", function( e, ui ){
      getPassword = function() {
        return p;
      }
      isDecrypting = function() {
        return true;
      }
      loadRecord( k );
      getPassword = getMasterPassword;
      isDecrypting = getIsDecryptingFromUI;
    } );
  }
//alert("decryptRecord: end");
}

function editRecord( t, v ){
//alert("editRecord: begin");

  vKey.time = t;
  vKey.version = v;
  var k = JSON.stringify( vKey );
  if( JSON.parse( extract( k ) ) == null ) {
    $( "body" ).one( "pagecontainerbeforetransition", function( e, ui ) {
      e.stopPropagation();
      e.preventDefault();
      alert( "No data in storage." );
      $.mobile.changePage( "#p02" );
      return false;
    } );
  }
  else {
    $( "body" ).one( "pagecontainerbeforeshow", function( e, ui ){
      loadRecord( k );
    } );
  }
//alert("editRecord: end");
}

function loadRecord( k ) {
//alert("loadRecord: begin");
  var getRecord;
  var obj;
  var hasPos = false;
  var lat, lng;
  var key = JSON.parse( k );
  var d = new Date();
  d.setTime( key.time );

  $( "#p03_lbl1" ).text( " [" + getDisplayFullString( d ) + "]" );
  $( "#p03_txt1" ).val( getISODateString( d ) );

  obj = JSON.parse( extract( k ) );

  $( "#p03_lbl2" ).text( " [" + obj.val + "]" );
  $( "#p03_txt2" ).val( obj.val );

  $( "#p03_lbl3" ).text( " [" + obj.opt + "]" );
  $( "input[name='p03_rch1'][value='" + obj.opt + "']" ).prop( "checked", true );
  $( "input[name='p03_rch1'][value!='" + obj.opt + "']" ).prop( "checked", false );
  $( "input[name='p03_rch1']" ).checkboxradio( "refresh" );

  $( "#p03_lbl4" ).text( " [" + obj.sub + "]" );
  $( "#p03_txt3" ).val( obj.sub );

  $( "#p03_map1" ).empty();
  if( obj.lat == undefined || obj.lng == undefined ) {
    $( "#p03_btn1" ).button( "disable" );
  }
  else {
    hasPos = true;
    lat = obj.lat;
    lng = obj.lng;

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

  if( obj.dsc != undefined ){
    $( "#p03_txa1" ).val( obj.dsc );
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

  $( "#p03_btnd" ).unbind( "click" );
  $( "#p03_btnd" ).click( function( e ){
      deleteClicked( k );
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

  $( "#p03_btn2" ).unbind( "click" );
  $( "#p03_btn2" ).click( function( e ){
    if( isSameISODate( d, getDateFromUI() ) && isSameRecord( obj, getRecord() ) ) {
      $.mobile.changePage( "#p02", { transition: "slide", reverse: true } );
    }
    else {
      confirmUpdate( k, getDateFromUI(), getRecord );
    }
  } );
//alert("loadRecord: end");
}

function checkPassword( k ) {
//alert("checkPassword: begin");
  var msg = isDecrypting()?"Can not decrypt the record by master password. Enter another password.":"Enter password.";
  var p = prompt( msg );

  if( p != null && ! isDecryptable( k, p ) ) {
    alert( "Wrong password." );
    p = null;
  }

//alert("checkPassword: end: "+p);
  return p;
}

function isSameRecord( cr, nr ) {
//alert("isSameRecord: begin");
//alert( JSON.stringify(cr) );
//alert( JSON.stringify(nr) );
  var ret = (
  cr.val == nr.val && 
  cr.opt == nr.opt && 
  cr.sub == nr.sub && 
  ( ( cr.lat == undefined && 
      cr.lng == undefined && 
      nr.lat == undefined && 
      nr.lng == undefined ) 
  ||( cr.lat != undefined && 
      nr.lat != undefined && 
      cr.lng != undefined && 
      nr.lng != undefined && 
      cr.lat == nr.lat && 
      cr.lng == nr.lng ) ) && 
  ( ( cr.dsc == undefined && 
      $( "#p03_txa1" ).val().length == 0 )
  ||( cr.dsc != undefined && 
      cr.dsc == $( "#p03_txa1" ).val() ) )
  );

//alert("isSameRecord: end: "+ret);

  return ret;
}

function getDateFromUI(){
  var d = new Date();
  var str = $( "input[name='p03_txt1']" ).val();
  d.setTime( Date.parse( str + ":00+09:00") );

  return d;
}

function initSelectUI( source, target, adds ) {
  var elms, i;
  var result = "<option value=\"\" selected=\"selected\"></option>";
  var val = $( source ).val();

  if( val != null && val.length > 0 ) {
    elms = toTrimedStringArray( val );

    if( adds != null ) {
      for( i = 0; i < adds.length; i++ ) {
        if( elms.indexOf( adds[i] ) == -1 ) {
          elms.push( adds[i] );
        }
      }
    }

    for( i = 0; i < elms.length; i++ ) {
      result += "<option value=\"" + elms[i] + "\">" + removeTag( elms[i] ) + "</option>";
    }

    $( target ).empty();
    $( target ).append( result );
    $( target ).trigger( "create" );
  }
}

function deleteClicked( k ) {
  var key = JSON.parse( k );
  var d = new Date();
  d.setTime( key.time );
  var msg = "Are you sure, you would like to delete this record on " + getDisplayDateString( d ) + " " + getDisplayTimeString( d ) + " ?";

  if( confirm( msg ) ) {
    deleteRecord( k );
    initMenus();
    $.mobile.changePage( "#p02", { transition: "pop", reverse: true } );
  }
}

function deleteRecord( k ) {
  if( isKey( k ) ) {
    storage.removeItem( k );
  }
}


// p04 functions

/* idKey
0: #p04_txa1
1: p04_rch1
2: p04_rch2
3: p04_rch3
4: p04_flp1
5: #p04_txa2
6: p04_rch4
7: p04_rch5
8: #p04_chb1
9: #p04_chb2
*/

function initSettingUI() {
//alert("initSettingUI: begin");
  settings = [];

  var i;
  var ids = [0, 5];
  for( i = 0; i < ids.length; i++ ) {
    settings[ids[i]] = {};
    settings[ids[i]].isChanged = isTextChanged( idKey[ids[i]] );
    settings[ids[i]].restoreSetting = restoreTextSetting( idKey[ids[i]] );
    settings[ids[i]].saveSetting = saveTextSetting( idKey[ids[i]] );
  }

  ids = [1, 2, 3, 6, 7];
  for( i = 0; i < ids.length; i++ ) {
    settings[ids[i]] = {};
    settings[ids[i]].isChanged = isRadioChanged( idKey[ids[i]] );
    settings[ids[i]].restoreSetting = restoreRadioSetting( idKey[ids[i]] );
    settings[ids[i]].saveSetting = saveRadioSetting( idKey[ids[i]] );
  }

  settings[4] = {};
  settings[4].isChanged = isFlipChanged( idKey[4] );
  settings[4].restoreSetting = restoreFlipSetting( idKey[4] );
  settings[4].saveSetting = saveFlipSetting( idKey[4] );

  ids = [8, 9];
  for( i = 0; i < ids.length; i++ ) {
    settings[ids[i]] = {};
    settings[ids[i]].isChanged = isCheckChanged( idKey[ids[i]] );
    settings[ids[i]].restoreSetting = restoreCheckSetting( idKey[ids[i]] );
    settings[ids[i]].saveSetting = saveCheckSetting( idKey[ids[i]] );
  }

  restoreSetting();
  saveSetting();

  setMasterPassword();

//alert("initSettingUI: end");
}

function setMasterPassword() {
  var msg = "Enter master password for ";
  var f = false;
  var val;

  if( $( "#p04_chb1" ).prop( "checked" ) ) {
    msg = msg + "decryption";
    f = true;
    if( $( "#p04_chb2" ).prop( "checked" ) ) {
      msg = msg + " and encryption.";
    }
    else {
      msg = msg + ".";
    }
  }
  else {
    if( $( "#p04_chb2" ).prop( "checked" ) ) {
      msg = msg + "encryption.";
      f = true;
    }
  }
  msg = msg + "If canceled, recording data would not be crypted.";
  if( f ) {
    val = prompt( msg );
    if( val == null ) {
      $( "#p04_chb1" ).prop( "checked", false );
      $( "#p04_chb2" ).prop( "checked", false );
      //val = "";
    }
    $( "#p04_pas1" ).val( val );
  }
}

function getMasterPassword() {
  return $( "#p04_pas1" ).val();
  //return idSgn;
  //return "1234"
}

function getIsDecryptingFromUI() {
  return $( "#p04_chb1" ).prop( "checked" );
  //return false;
  //return true;
}

function getIsEncryptingFromUI() {
  return $( "#p04_chb2" ).prop( "checked" )
  //return false;
  //return true;
}

function isTextChanged( id ) {
  var val;
  return function() {
    sKey.id = id;
    val = storage.getItem( JSON.stringify( sKey ) );
    return ( val == null || $( id ).val() != val );
  }
}

function isRadioChanged( id ) {
  var val;
  return function() {
    sKey.id = id;
    val = storage.getItem( JSON.stringify( sKey ) );
    return ( val == null || $( "input[name='" + id + "']:checked" ).val() != val );
  }
}

function isFlipChanged( id ) {
  var val;
  return function() {
    sKey.id = id;
    val = storage.getItem( JSON.stringify( sKey ) );
    return ( val == null || $( "select[name='" + id + "'] option:selected" ).val() != val );
  }
}

function isCheckChanged( id ) {
  var val;
  return function() {
    sKey.id = id;
    val = storage.getItem( JSON.stringify( sKey ) );
    val=(val==="false")?false:true;
    return ( val == null || $( id ).prop( "checked" ) != val );
  }
}

function isSettingChanged() {
  var ret = false;
  var i;

  for( i = 0; i < settings.length; i++ ) {
    ret = settings[i].isChanged();
    if( ret ) {
      break;
    }
  }

  return ret;
}

function restoreTextSetting( id ) {
  var val;
  return function() {
    sKey.id = id;
    val = storage.getItem( JSON.stringify( sKey ) );
    if( val != null ) {
      $( id ).val( val );
    }
  }
}

function restoreRadioSetting( id ) {
  var val;
  return function() {
    sKey.id = id;
    val = storage.getItem( JSON.stringify( sKey ) );
    if( val != null ) {
      checkRadioUI( id, val );
      $( "#p04" ).one( "pagebeforeshow", function( e ){
        $( "input[name='" + id + "']" ).checkboxradio( "refresh" );
      } );
    }
  }
}

function restoreFlipSetting( id ) {
  var val;
  return function() {
    sKey.id = id;
    val = storage.getItem( JSON.stringify( sKey ) );
    if( val != null ) {
      selectSelectUI( id, val );
      $( "#p04" ).one( "pagebeforeshow", function( e ){
        $( "select[name='" + id + "']" ).flipswitch( "refresh" );
      } );
    }
  }
}

function restoreCheckSetting( id ) {
  var val;
  return function() {
    sKey.id = id;
    val = storage.getItem( JSON.stringify( sKey ) );
    val=(val==="false")?false:true;
    if( val != null ) {
      $( id ).prop( "checked", val );
      $( "#p04" ).one( "pagebeforeshow", function( e ){
        $( id ).checkboxradio( "refresh" );
      } );
    }
  }
}

function restoreSetting() {
  var i;
  for( i = 0; i < settings.length; i++ ) {
    settings[i].restoreSetting();
  }
}

function saveTextSetting( id ) {
  var val;
  return function() {
    sKey.id = id;
    val = $( id ).val();
    if( val.length > 0 ) {
      storage.setItem( JSON.stringify( sKey ), val );
    }
    else {
      storage.removeItem( JSON.stringify( sKey ) );
    }
  }
}

function saveRadioSetting( id ) {
  var val;
  return function() {
    sKey.id = id;
    val = $( "input[name='" + id + "']:checked" ).val();
    storage.setItem( JSON.stringify( sKey ), val );
  }
}

function saveFlipSetting( id ) {
  var val;
  return function() {
    sKey.id = id;
    val = $( "select[name='" + id + "'] option:selected" ).val();
  storage.setItem( JSON.stringify( sKey ), val );
  }
}

function saveCheckSetting( id ) {
  var val;
  return function() {
    sKey.id = id;
    val = $( id ).prop( "checked" );
    storage.setItem( JSON.stringify( sKey ), val );
  }
}

function saveSetting() {
  var i;

  for( i = 0; i < settings.length; i++ ) {
    settings[i].saveSetting();
  }
}

function postRecord() {
  var val, opt;

  // Recording Location
  val = $( "input[name='" + idKey[2] + "']:checked" ).val();
//alert( val );

  switch( val ) {
  case "on":
    $( "#p01_chb1" ).prop( "checked", true );
    break;
  case "off":
    $( "#p01_chb1" ).prop( "checked", false );
    break;
  default:
    ;// nothing to do.
  }
  $( "#p01_chb1" ).checkboxradio( "refresh" );

  opt = $( "input[name='p01_opt']:checked" ).val();
//alert( opt );

  // Clearing Subtitle
  val = $( "input[name='" + idKey[6] + "']:checked" ).val();
//alert( val );

  switch( val ) {
  case "always":
    $( "#p01_txt1" ).val( "" );
    selectSelectUI( "p01_sel1", "" );
    break;
  case "withend":
    if( opt == "End" ) {
      $( "#p01_txt1" ).val( "" );
      selectSelectUI( "p01_sel1", "" );
    }
    break;
  default:
    ;// nothing to do.
  }

  // Rotating Option
  val = $( "input[name='" + idKey[7] + "']:checked" ).val();
//alert( val );

  switch( val ) {
  case "bande":
    switch( opt ) {
    case "Begin":
      checkRadioUI( "p01_opt", "End" );
      break;
    case "End":
      checkRadioUI( "p01_opt", "Begin" );
      break;
    default:
      ;// nothing to do.
    }
    break;
  case "btoeton":
    switch( opt ) {
    case "Begin":
      checkRadioUI( "p01_opt", "End" );
      break;
    case "End":
      checkRadioUI( "p01_opt", "None" );
      break;
    default:
      ;// nothing to do.
    }
    break;
  default:
    ;// nothing to do.
  }

  $( "input[name='p01_opt']" ).checkboxradio( "refresh" );
}

function checkRadioUI( target, value ) {
  $( "input[name='" + target + "'][value='" + value + "']" ).prop( "checked", true );
  $( "input[name='" + target + "'][value!='" + value + "']" ).prop( "checked", false );
}

function selectSelectUI( target, value ) {
  $( "select[name='" + target + "'] option[value='" + value + "']" ).prop( "selected", true );
  $( "select[name='" + target + "'] option[value!='" + value + "']" ).prop( "selected", false );
}

function getZoomValueFromUI() {
  return $( "input[name='" + idKey[1] + "']:checked" ).val();
}

function getModeValueFromUI() {
  return Number( $( "input[name='" + idKey[3] + "']:checked" ).val() ) + Number( $( "select[name='" + idKey[4] + "'] option:selected" ).val() );
}

function setModeValueToUI( mode ) {
  var val = mode % 2;
//alert("radio: "+val);
  checkRadioUI( idKey[3], val );

  val = mode - ( mode % 2 );
//alert("flip: "+val);
  selectSelectUI( idKey[4], val );

  $( "#p04" ).one( "pagebeforeshow", function( e ){
    $( "input[name='" + idKey[3] + "']" ).checkboxradio( "refresh" );

    $( "select[name='" + idKey[4] + "']" ).flipswitch( "refresh" );
  } );
}

function confirmSaveSetting() {
  var msg = "Save and apply setting changes ? if you choose cancel, all changes are discarded.";

  if( confirm( msg ) ) {
    initMainUI();
    saveSetting();
    $.mobile.changePage( "#p01", { transition: "slide" } );
  }
  else {
    $.mobile.changePage( "#p01", { transition: "slide" } );
    restoreSetting();
  }
}


// p06 functions

function confirmUpdate( k, dd, getRecord ){
//alert("confirmUpdate: begin");
  var doUpdate, doSaveNew;
  var key = JSON.parse( k );
  var d = new Date();
  d.setTime( key.time );

  $( "#p06_btnc" ).unbind( "click" );
  $( "#p06_btnc" ).click( function( e ){
    $.mobile.changePage( "#p02", { transition: "pop", reverse: true } );
  } );

  $( "#p06_btnu" ).unbind( "click" );
  $( "#p06_btnn" ).unbind( "click" );

  if( isSameISODate( d, dd ) ){
    doUpdate = function( e ){
      cleanupRecords( key.time );
      restore( createKey( key.time ), getRecord );
      initMenus();
      $.mobile.changePage( "#p02", { transition: "pop", reverse: true } );
    };
    doSaveNew = function( e ){
      alert( "Date or time must be changed." );
    };
    $( "#p06_btnn" ).toggleClass( "ui-state-disabled", true );
  }
  else {
    doUpdate = function( e ){
      if( isOverwrite( dd ) ) {
        restore( createKey( dd.getTime() ), getRecord );
        cleanupRecords( key.time );
        initMenus();
        $.mobile.changePage( "#p02", { transition: "pop", reverse: true } );
      }
    };
    doSaveNew = function( e ){
      if( isOverwrite( dd ) ) {
        restore( createKey( dd.getTime() ), getRecord );
        initMenus();
        $.mobile.changePage( "#p02", { transition: "pop", reverse: true } );
      }
    };
    $( "#p06_btnn" ).toggleClass( "ui-state-disabled", false );
  }

  $( "#p06_btnu" ).click( doUpdate );
  $( "#p06_btnn" ).click( doSaveNew );

  $.mobile.changePage( "#p06", { transition: "pop" } );
//alert("confirmUpdate: end");
}

function getExistingKeys( t ) {
//alert("getExistingKeys: begin");
  var i, k = null, v = null;
  var ret = [];

  vKey.time = t;
  for( i = 0; i < idVer.length; i++ ) {
    vKey.version = idVer[i];
    k = JSON.stringify( vKey );
    v = storage.getItem( k );
    if( v != null ) {
      ret.push( k );
    }
    else {
      v = null;
    }
  }
//alert("getExistingKeys: end: "+ ret);
  return ret.length==0?null:ret;
}

function cleanupRecords( t ) {
  var i, ks = getExistingKeys( t );
  if( ks == null ) {
    return;
  }

  for( i = 0; i < ks.length; i++ ) {
    deleteRecord( ks[i] );
  }
}

function isOverwrite( d ) {
  var msg = "Record on " + getDisplayFullString( d ) + " has already existed. Over write?";
  var ret = false;
  var i, ks = getExistingKeys( d.getTime() );

  if( ks == null ) {
    return true;
  }

  ret = confirm( msg );
  if( ret ) {
    for( i = 0; i < ks.length; i++ ) {
      deleteRecord( ks[i] );
    }
  }

  return ret;
}

function restore( k, getRecord ) {
  store( k, getRecord );

  if( $( "#p03_txa1" ).val().length > 0 ){
    addDescription( k, $( "#p03_txa1" ).val() );
  }
}

function addDescription( k, desc ){
  var obj = JSON.parse( extract( k ) );
  var getRecord = function() {
    if( obj.lat == undefined || obj.lng == undefined ) {
      return { "val":obj.val, "opt":obj.opt, "sub":obj.sub, "dsc":desc };
    }
    else {
      return { "val":obj.val, "opt":obj.opt, "sub":obj.sub, "lat":obj.lat, "lng":obj.lng, "dsc":desc };
    }
  }

  store( k, getRecord );
}


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
})( this );
