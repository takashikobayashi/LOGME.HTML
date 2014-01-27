/* LOG ME | JavaScript, html5, jQuery and CSS3 Study | (c) 2013-2014 twitter@sumo_ninja_jp
*/

$.event.special.swipe.horizontalDistanceThreshold = 100;
$.event.special.swipe.verticalDistanceThreshold = 20;

var storage = localStorage;

var idDef = [ "lgme", "00" ];
var vKey = { "sign":idDef[0], "version":idDef[1], "time":"", "isDel":false };

var idKey = [ "#p04_txa1", "p04_rch1", "p04_rch2", "p04_rch3", "p04_flp1", "#p04_txa2", "p04_rch4", "p04_rch5" ];
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
//  checkUpdateReady();

  initApp();

  initSettingUI();
  initMainUI();
} );

function initApp() {
//alert("initApp: begin");
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


// #p01 functions

function initMainUI() {
//alert("initMainUI: begin");
  var i;
  var result = "";
  var elms;
  var val = $( idKey[0] ).val();
  var vals, subs;
  var obj, k, t;

  if( val != null && val.length > 0 ) {
    elms = toTrimedStringArray( val );

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
        var obj;

        recordClicked( t, e.target.value );

        vKey.time = t;
        obj = JSON.parse( storage.getItem( JSON.stringify( vKey ) ) );

//alert(JSON.stringify(obj));
        addTitleArray( t, obj.val );
        addSubArray( t, obj.sub );

        updateTitleMenu();
        updateSubMenu();
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

  vals = [];
  subs = [];
  for( i = 0; i < storage.length; i++ ) {
    k = storage.key(i);
    if( ! isKey( k ) ) {
      continue;
    }
    obj = JSON.parse( storage.getItem( k ) );
    t = JSON.parse( k ).time;

    addTitleArray( t, obj.val );
    addSubArray( t, obj.sub );
  }
  updateTitleMenu();
  updateSubMenu();

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
//alert("initMainUI: end");
}

function recordClicked( t, val ) {
  var getRecord = function() {
    return { "val":val, "opt":$( "input[name='p01_opt']:checked" ).val(), "sub":$( "input[name='p01_txt1']" ).val() };
  }

  store( t, getRecord );

  if( $( "input[name='p01_chb1']" ).is( ":checked" ) && navigator.geolocation ) {
    navigator.geolocation.getCurrentPosition( function( pos ) {
      addLocation( t, pos.coords.latitude, pos.coords.longitude );
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
  var i;
  var result = "";
  var divider = "";
  var keys;
  var d = new Date(), k, v;
  var mode = getModeValueFromUI();

  if( storage.length > 0 ) {
    keys = [];
    for( i = 0; i < storage.length; i++ ) {
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
      if( v.lat != undefined && v.lng != undefined ) {
        result += "<span class='ui-li-count'>!</span>";
      }
      result += "</a></li>";

    }
    result += "</ul>";
  }

//alert(result);

  return result;
}

function clearClicked( e ) {
  confirmDeleteAll();
  $("#p02_btns .ui-btn-active").toggleClass("ui-btn-active");
}

function confirmDeleteAll() {
  if( confirm( "Are you sure, you would like to delete all records ?" ) ){
    clearRecords();
    showRecords();
  }
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

  $( "#p03_btnd" ).unbind( "click" );
  $( "#p03_btnd" ).click( function( e ){
      confirmDelete( t );
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
    if( isSameISODate( d, getDateFromUI() ) && isSameRecord( record, getRecord() ) ) {
      $.mobile.changePage( "#p02", { transition: "slide", reverse: true } );
    }
    else {
      confirmUpdate( t, getRecord );
    }
  } );
}

function isSameRecord( cr, nr ) {
//alert( JSON.stringify(cr) );
//alert( JSON.stringify(nr) );
  return (
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

function confirmDelete( t ) {
  var d = new Date();
  d.setTime( t );

  if( confirm( "Are you sure, you would like to delete this record on " + getDisplayDateString( d ) + " " + getDisplayTimeString( d ) + " ?" ) ) {
    deleteRecord( t );
    $.mobile.changePage( "#p02", { transition: "pop", reverse: true } );
  }
}

function deleteRecord( t ) {
  vKey.time = t;
  var k = JSON.stringify( vKey );
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
*/

function initSettingUI() {
//alert("initSettingUI: begin");
  restoreSetting();

  $( "#p04_btnb" ).click( function( e ){
    if( isSettingChanged() ) {
      confirmSaveSetting();
    }
    else {
      $.mobile.changePage( "#p01", { transition: "slide" } );
    }
  } );

  saveSetting();
//alert("initSettingUI: end");
}

function isSettingChanged() {
  var ret = true;
  var i, val;

  var idx = [0, 5];
  for( i = 0; i < idx.length; i++ ) {
    sKey.id = idKey[idx[i]];
    val = storage.getItem( JSON.stringify( sKey ) );
    ret = ret && 
    ( ( val != null && 
        $( idKey[idx[i]] ).val() == val )
     || val == null );
  }

  idx = [1, 2, 3, 6, 7];
  for( i = 0; i < idx.length; i++ ) {
    sKey.id = idKey[idx[i]];
    val = storage.getItem( JSON.stringify( sKey ) );
    ret = ret &&
    ( ( val != null && 
        $( "input[name='" + idKey[idx[i]] + "']:checked" ).val() == val )
     || val == null );
  }

  sKey.id = idKey[4];
  val = storage.getItem( JSON.stringify( sKey ) );
  ret = ret &&
  ( ( val != null &&
      $( "select[name='" + idKey[4] + "'] option:selected" ).val() == val )
   || val == null );
//alert(ret);
  return ! ret;
}

function restoreSetting() {
  var i, val;

  var idx = [0, 5];
  for( i = 0; i < idx.length; i++ ) {
    sKey.id = idKey[idx[i]];
    val = storage.getItem( JSON.stringify( sKey ) );
    if( val != null ) {
      $( idKey[idx[i]] ).val( val );
    }
  }

  idx = [1, 2, 3, 6, 7];
  for( i = 0; i < idx.length; i++ ) {
    sKey.id = idKey[idx[i]];
    val = storage.getItem( JSON.stringify( sKey ) );
    if( val != null ) {
      checkRadioUI( idKey[idx[i]], val );
    }

    ( function() {
      var j = i;
      $( "#p04" ).one( "pagebeforeshow", function( e ){
//alert("refreshCheckbox["+j+"]: begin");
        $( "input[name='" + idKey[idx[j]] + "']" ).checkboxradio( "refresh" );
//alert("refreshCheckbox["+j+"]: end");
      } );
    } )();
  }

  sKey.id = idKey[4];
  val = storage.getItem( JSON.stringify( sKey ) );
  if( val != null ) {
    selectSelectUI( idKey[4], val );
  }

  $( "#p04" ).one( "pagebeforeshow", function( e ){
//alert("refreshFlip: begin");
    $( "select[name='" + idKey[4] + "']" ).flipswitch( "refresh" );
//alert("refreshFlip: end");
  } );
}

function saveSetting() {
  var i, val;

  var idx = [0, 5];
  for( i = 0; i < idx.length; i++ ) {
    sKey.id = idKey[idx[i]];
    val = $( idKey[idx[i]] ).val();
    if( val.length > 0 ) {
      storage.setItem( JSON.stringify( sKey ), val );
    }
    else {
      storage.removeItem( JSON.stringify( sKey ) );
    }
  }

  idx = [1, 2, 3, 6, 7];
  for( i = 0; i < idx.length; i++ ) {
    sKey.id = idKey[idx[i]];  
    val = $( "input[name='" + idKey[idx[i]] + "']:checked" ).val();
    storage.setItem( JSON.stringify( sKey ), val );
  }

  sKey.id = idKey[4];
  val = $( "select[name='" + idKey[4] + "'] option:selected" ).val();
  storage.setItem( JSON.stringify( sKey ), val );
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
  if( confirm( "Save and apply setting changes ? if you choose cancel, all changes are discarded." ) ) {
    initMainUI();
    saveSetting();
    $.mobile.changePage( "#p01", { transition: "pop", reverse: true } );
  }
  else {
    $.mobile.changePage( "#p01", { transition: "pop", reverse: true } );
    restoreSetting();
  }
}


// p06 functions

function confirmUpdate( t, getRecord ){
//alert("initUpdateConfirm: begin");
  var doUpdate, doSaveNew;
  var dd = getDateFromUI();
  var d = new Date();
  d.setTime( t );

  $( "#p06_btnc" ).unbind( "click" );
  $( "#p06_btnc" ).click( function( e ){
    $.mobile.changePage( "#p02", { transition: "pop", reverse: true } );
  } );

  $( "#p06_btnu" ).unbind( "click" );
  $( "#p06_btnn" ).unbind( "click" );

  if( isSameISODate( d, dd ) ){
    doUpdate = function( e ){
        restore( t, getRecord );
        $.mobile.changePage( "#p02", { transition: "pop", reverse: true } );
    };
    doSaveNew = function( e ){
      alert( "Date or time must be changed." );
    };
    $( "#p06_btnn" ).toggleClass( "ui-state-disabled", true );
  }
  else {
    doUpdate = function( e ) {
      if( isOverwrite( dd.getTime() ) ){
        restore( dd.getTime(), getRecord );
        deleteRecord( t );
        $.mobile.changePage( "#p02", { transition: "pop", reverse: true } );
      }
    };
    doSaveNew = function( e ){
      if( isOverwrite( dd.getTime() ) ) {
        restore( dd.getTime(), getRecord );
        $.mobile.changePage( "#p02", { transition: "pop", reverse: true } );
      }
    };
    $( "#p06_btnn" ).toggleClass( "ui-state-disabled", false );
  }
  $( "#p06_btnu" ).click( doUpdate );
  $( "#p06_btnn" ).click( doSaveNew );

  $.mobile.changePage( "#p06", { transition: "pop" } );
//alert("initUpdateConfirm: end");
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
