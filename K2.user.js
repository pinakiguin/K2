// ==UserScript==
// @name          KanyashreeHelper
// @namespace     https://github.com/abusalam/K2
// @description   Helper Script For Kanyashree Approval and Sanction Generation
// @include       http://wbkanyashree.gov.in/*
// @grant         none
// @downloadURL   https://github.com/abusalam/K2/raw/master/K2.user.js
// @updateURL     https://github.com/abusalam/K2/raw/master/K2.user.js
// @version       1.2.0
// @icon          http://www.gravatar.com/avatar/43f0ea57b814fbdcb3793ca3e76971cf
// ==/UserScript==

/**
 * How can I use jQuery in Greasemonkey scripts in Google Chrome?
 * All Credits to Original Author for this wonderful function.
 *
 * @author  Erik Vergobbi Vold & Tyler G. Hicks-Wright
 * @link    http://stackoverflow.com/questions/2246901
 * @param   callback
 * @returns {undefined}
 */
function jQueryInclude(callback) {
  var jQueryScript = document.createElement("script");
  var jQueryCDN = "//ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js";
  jQueryScript.setAttribute("src", jQueryCDN);
  jQueryScript.addEventListener('load', function () {
    var UserScript = document.createElement("script");
    UserScript.textContent = 'window.jQ=jQuery.noConflict(true);'
        + 'var BaseURL = "http://wbkanyashree.gov.in/";'
        + '(' + callback.toString() + ')();';
    document.head.appendChild(UserScript);
  }, false);
  document.head.appendChild(jQueryScript);
}

/**
 * Main Body of Helper Script For Kanyashree Approval and Sanction Generation
 */
jQueryInclude(function () {

  jQ("#top").hide();
  jQ("#header").hide();
  jQ("#footerMain").hide();
  jQ("option").html(function () {
    return jQ(this).val() + " - " + jQ(this).html();
  });
  jQ("#content_spc").css({"height": ""}).css({"height": "auto"});
  var HackUI = '<div style="text-align:center;clear:both;">'
      + '<div>'
      + '<div style="text-align:right;width:320px;" id="Msg"></div>'
      + '<div id="reCaptcha"></div>'
      + '</div>'
      + '<div id="Info"></div>'
      + '<textarea id="AllIDs" rows="25" cols="70"></textarea><br/>'
      + '<input type="button" id="CmdClear" value="Del"/>'
      + '<input type="button" id="CmdGo" value="Go"/>'
      + '<input type="button" id="CmdClearIDs" value="Clear IDs"/>'
      + '<input type="button" id="CmdStatus" value="Show"/>'
      + '<input type="button" id="CmdClearStorage" value="Delete All"/>'
      + '<input type="button" id="CmdSelectAll" value="Select All"/>'
      + '</div>';

  var ActionList = '<label for="">Go For: </label>'
      + '<select id="OptYear" >'
      + '<option value="2014">2014</option>'
      + '<option value="2013">2013</option>'
      + '<option value="2015">2015</option>'
      + '</select>'
      + '<select id="OptAction" >'
      + '<option value="BlockList">1. Block List</option>'
      + '<option value="ClgList">2. College List</option>'
      + '<option value="ClgAppList">3. College Applicants</option>'
      + '<option value="ClgAppListU">4. College Applicants(Upgradation)</option>'
      + '<option value="SchList">5. School List(All Schools)</option>'
      + '<option value="SchListP">6. School List K1</option>'
      + '<option value="SchAppList">7. School K1 Applicants</option>'
      + '<option value="SchK2ListP">8. School List K2</option>'
      + '<option value="SchK2AppList">9. School K2 Applicants</option>'
      + '<option value="SchListR">10. School List K1(Renewal)</option>'
      + '<option value="SchAppListR">11. School K1 Applicants(Renewal)</option>'
      + '<option value="SchK2ListU">12. School List K2(Upgradation)</option>'
      + '<option value="SchK2AppListU">13. School K2 Applicants(Upgradation)</option>'
      + '<option value="Finalize">14. Finalize Applications</option>'
      + '<option value="AddToSanction">15. Add To Sanction Order</option>'
      + '<option value="RejectApp">16. Reject Applications</option>'
      + '</select>';

  if (jQ("#intra_body_area").is(":visible")) {
    jQ("#intra_body_area").after(HackUI);
    jQ("#CmdClear").before(ActionList);
  }

  jQ("[id^=Cmd]").css({
    "margin": "5px",
    "padding": "5px"
  });

  jQ("#CmdSelectAll").click(function () {
    jQ("[type=checkbox]").each(function () {
      //this.checked=true;
    });
    var AllApps = "";
    jQ(document.body).find("table.tftable tr td:nth-child(2)")
        .each(function (Index, Item) {
          AppNo = jQ(Item).text().trim().substr(0, 20);
          AppName = jQ(Item).next().text();
          Finalised = jQ(Item).next().next().text();
          if (AllApps !== "") {
            AllApps = AllApps + "," + AppNo;
          } else {
            AllApps = AllApps + AppNo;
          }

        });
    jQ("#AllIDs").text(AllApps);
  });

  jQ("#Msg").css({
    "text-align": "right",
    "display": "inline-block",
    "border": "2px dashed greenyellow",
    "padding": "10px",
    "margin": "10px",
    "float": "left"
  });

  jQ("#reCaptcha").css({
    "text-align": "center",
    "display": "inline-block",
    "border": "2px dashed greenyellow",
    "padding": "5px",
    "margin": "10px",
    "float": "left",
    "clear": "both"
  }).hide();

  jQ("#AllIDs").css({
    "width": "550px"
  });

  /**
   * Limits No of AjaxCalls at a time
   *
   * @param {type} Fn
   * @param {type} Arg1
   * @param {type} Arg2
   * @param {type} Arg3
   * @param {type} Arg4
   * @returns {Boolean}
   */
  var AjaxFunnel = function (Fn, Arg1, Arg2, Arg3, Arg4) {
    var NextCallTimeOut = 2500;
    var PendingAjax = parseInt(localStorage.getItem('AjaxPending'));
    var AjaxLimit = parseInt(localStorage.getItem('AjaxLimit'));
    if (AjaxLimit === null) {
      AjaxLimit = 5;
    }
    if (PendingAjax > AjaxLimit) {
      if (typeof Arg1 === "undefined") {
        setTimeout(AjaxFunnel(Fn), NextCallTimeOut);
      } else if (typeof Arg2 === "undefined") {
        setTimeout(AjaxFunnel(Fn, Arg1), NextCallTimeOut);
      } else if (typeof Arg3 === "undefined") {
        setTimeout(AjaxFunnel(Fn, Arg1, Arg2), NextCallTimeOut);
      } else if (typeof Arg4 === "undefined") {
        setTimeout(AjaxFunnel(Fn, Arg1, Arg2, Arg3), NextCallTimeOut);
      } else {
        setTimeout(AjaxFunnel(Fn, Arg1, Arg2, Arg3, Arg4), NextCallTimeOut);
      }
      return false;
    } else {
      if (typeof Arg1 === "undefined") {
        AjaxPending("Start");
        return Fn();
      } else if (typeof Arg2 === "undefined") {
        AjaxPending("Start");
        return Fn(Arg1);
      } else if (typeof Arg3 === "undefined") {
        AjaxPending("Start");
        return Fn(Arg1, Arg2);
      } else if (typeof Arg4 === "undefined") {
        AjaxPending("Start");
        return Fn(Arg1, Arg2, Arg3);
      } else {
        AjaxPending("Start");
        return Fn(Arg1, Arg2, Arg3, Arg4);
      }
    }
  };

  /**
   * Records the No of Ajax Calls
   *
   * @param {type} AjaxState
   * @returns {undefined}
   */
  var AjaxPending = function (AjaxState) {
    var StartAjax = parseInt(localStorage.getItem('AjaxPending'));
    if (AjaxState === "Start") {
      localStorage.setItem('AjaxPending', StartAjax + 1);
    } else {
      localStorage.setItem('AjaxPending', StartAjax - 1);
    }
  };

  /**
   * Reject Applications for Re-Sanctioning
   * POST /admin_pages/kp_reject_bank_status.php HTTP/1.1
   *
   * rej_reason=16001,16002,16003,16005,16006
   * &phy_veri=undefined
   * &fwd_to=undefined
   * &applicant_id=19200100703130000001
   *
   * @param {type} AppID
   * @returns {undefined}
   */
  var RejectAppID = function (AppID) {
    localStorage.setItem('Status', 'Reject-AppID: ' + AppID);
    var KeyPrefix = localStorage.getItem('KeyPrefix');
    jQ.ajax({
      type: 'POST',
      url: BaseURL + 'admin_pages/kp_reject_bank_status.php',
      dataType: 'html',
      xhrFields: {
        withCredentials: true
      },
      data: {
        'rej_reason': '16001,16002,16003,16005,16006',
        'phy_veri': 'undefined',
        'fwd_to': 'undefined',
        'applicant_id': AppID
      }
    }).done(function (data) {
      var AppIndex = 0;
      try {
        AppIndex = parseInt(localStorage.getItem(KeyPrefix + 'Count')) + 1;
        localStorage.setItem(KeyPrefix + AppID, data);
        localStorage.setItem(KeyPrefix + 'Count', AppIndex);
      }
      catch (e) {
        localStorage.setItem(KeyPrefix + ' Error:' + AppID, e);
      }
    }).fail(function (FailMsg) {
      localStorage.setItem(KeyPrefix + ' Fail:' + AppID, FailMsg.statusText);
    }).always(function () {
      AjaxPending("Stop");
    });
  };

  /**
   * admin_pages/kp_sanction_order_generation_insert.php?
   * applicant_id=19200301cl0130000001
   * sanction_order=19200700213003
   * type=add
   *
   * @param {string} fYear
   * @returns {void}
   */
  var AddToSanction = function (fYear) {
    localStorage.setItem('Status', 'AddToSanction-' + fYear + ': ');
    var OrderNo = localStorage.getItem('OrderNo');
    jQ.ajax({
      type: 'POST',
      url: BaseURL + 'admin_pages/kp_sanction_order_generation_insert.php',
      dataType: 'html',
      xhrFields: {
        withCredentials: true
      },
      data: {
        'selectedIds': jQ("#AllIDs").val(),
        'sanction_order': OrderNo,
        'type': 'add',
        'year': fYear,
        'security_code': jQ("#captchaCode").val()
      }
    }).done(function (data) {
      try {
        var SanctionStatus = jQ(data).find("div.sanction_block").next().text();
        localStorage.setItem('AddToSanction-' + fYear + ':', SanctionStatus);
      }
      catch (e) {
        localStorage.setItem('AddToSanction-' + fYear + ' Error:', e);
      }
    }).fail(function (FailMsg) {
      localStorage.setItem('AddToSanction-' + fYear + ' Fail:', FailMsg.statusText);
    }).always(function () {
      AjaxPending("Stop");
    });
  };

  /**
   * Approve Applications for Sanctioning
   *
   * @param {type} AppID
   * @param {type} fYear
   * @returns {undefined}
   */
  var FinalizeAppID = function (AppID, fYear) {
    localStorage.setItem('Status', 'SanctionAppID: ' + AppID);
    var KeyPrefix = localStorage.getItem('KeyPrefix');
    jQ.ajax({
      type: 'POST',
      url: BaseURL + 'admin_pages/kp_fwd_post.php',
      dataType: 'html',
      xhrFields: {
        withCredentials: true
      },
      data: {
        'rej_reason': '',
        'phy_veri': 'undefined',
        'fwd_to': '10047',
        'applicant_id': AppID,
        'table_year': fYear
      }
    }).done(function (data) {
      try {
        localStorage.setItem(KeyPrefix + ':' + AppID, data);
      }
      catch (e) {
        localStorage.setItem(KeyPrefix + ' Error:' + AppID, e);
      }
    }).fail(function (FailMsg) {
      localStorage.setItem(KeyPrefix + ' Fail:' + AppID, FailMsg.statusText);
    }).always(function () {
      AjaxPending("Stop");
    });
  };

  /**
   * kp_block_verify_applicant_list.php?
   * schcd=19202103702&
   * status=10042&pending=
   *
   * block_select=192021&schcd=19202103702&status=10042&mode=search&download=Submit
   *
   * @param {type} SchCode
   * @param {String} Scheme
   * @param {type} PageNo
   * @param {type} fYear
   * @returns {undefined}
   */
  var GetSchAppList = function (SchCode, Scheme, PageNo, fYear) {
    localStorage.setItem('Status', 'GetSchAppList: ' + SchCode);
    var KeyPrefix = localStorage.getItem('KeyPrefix');
    if (Scheme === "K2U") {
      Scheme = "_list_upgradation.php";
    } else if (Scheme === "K1R") {
      Scheme = "_list_renewal.php";
    } else if (Scheme === "K2") {
      Scheme = "_list_one.php";
    } else {
      Scheme = "_list.php";
    }
    jQ.ajax({
      type: 'GET',
      url: BaseURL + 'admin_pages/kp_block_verify_applicant' + Scheme,
      dataType: 'html',
      xhrFields: {
        withCredentials: true
      },
      data: {
        'year': fYear,
        'status': '10042',
        'schcd': SchCode,
        'pending': '1',
        'page': PageNo
      }
    }).done(function (data) {
      try {
        var AppNo = '', AppName = '', AppIndex = 0, Finalised = '';
        jQ(data).find("table.tftable tr td:nth-child(2)")
            .each(function (Index, Item) {
              AppNo = jQ(Item).text().trim().substr(0, 20);
              AppName = jQ(Item).next().text();
              Finalised = jQ(Item).next().next().text();
              Finalised = "Is " + Finalised;
              if (Finalised.indexOf("FINALIZED") < 0) {
                AppIndex = parseInt(localStorage.getItem(KeyPrefix + 'Count')) + 1;
                localStorage.setItem(KeyPrefix + AppNo, AppName);
                localStorage.setItem(KeyPrefix + 'Count', AppIndex);
              }
            });
      }
      catch (e) {
        localStorage.setItem(KeyPrefix + ' Error:', e);
      }
    }).fail(function (FailMsg) {
      localStorage.setItem(KeyPrefix + ' Fail:', FailMsg.statusText);
    }).always(function () {
      AjaxPending("Stop");
    });
  };

  /**
   * http://wbkanyashree.gov.in/admin_pages/kp_dpmu_verify_block_list.php
   * block_select=192018&tot_pen=192018&schcd=&status=10042&mode=search
   *
   * @param {type} BlockCode
   * @param {String} Scheme
   * @param {type} fYear
   * @returns {undefined}
   */
  var GetSchListPending = function (BlockCode, fYear, Scheme) {
    localStorage.setItem('Status', 'GetSchListP: ' + BlockCode);
    var KeyPrefix = localStorage.getItem('KeyPrefix');
    var UrlLength = 51;
    if (Scheme === "K2U") {
      Scheme = "_list_upgradation.php";
      UrlLength = 63;
    } else if (Scheme === "K1R") {
      Scheme = "_list_renewal.php";
      UrlLength = 59;
    } else if (Scheme === "K2") {
      Scheme = "_list_one.php";
      UrlLength = 55;
    } else {
      Scheme = "_list.php";
    }
    jQ.ajax({
      type: 'POST',
      url: BaseURL + 'admin_pages/kp_dpmu_verify_block' + Scheme,
      dataType: 'html',
      xhrFields: {
        withCredentials: true
      },
      data: {
        'drop_down': fYear,
        'block_select': BlockCode,
        'tot_pen': BlockCode,
        'schcd': '',
        'status': '10042',
        'mode': 'search'
      }
    }).done(function (data) {
      try {
        var SchCode = '', SchName = '', SchIndex = 0;
        jQ(data).find("table.tftable tr td:nth-child(2) a").each(function (Index, Item) {
          SchCode = jQ(Item).attr("href").trim().substr(UrlLength, 11);
          SchName = jQ(Item).text();
          if (SchCode.length > 0) {
            SchIndex = parseInt(localStorage.getItem(KeyPrefix + 'Count')) + 1;
            localStorage.setItem(KeyPrefix + SchCode, SchName);
            localStorage.setItem(KeyPrefix + 'Count', SchIndex);
          }
        });
      }
      catch (e) {
        localStorage.setItem(KeyPrefix + ' Error:', e);
      }
    }).fail(function (FailMsg) {
      localStorage.setItem(KeyPrefix + ' Fail:', FailMsg.statusText);
    }).always(function () {
      AjaxPending("Stop");
    });
  };

  /**
   *
   * @param {type} BlockCode
   * @returns {undefined}
   */
  var GetSchList = function (BlockCode) {
    localStorage.setItem('Status', 'GetSchList: ' + BlockCode);
    var KeyPrefix = localStorage.getItem('KeyPrefix');
    jQ.ajax({
      type: 'POST',
      url: BaseURL + 'admin_pages/ajax/find_school_for_block.php',
      dataType: 'html',
      xhrFields: {
        withCredentials: true
      },
      data: {
        'block_code': BlockCode,
        'slc_name': 'schcd',
        'slc_class': ''
      }
    }).done(function (data) {
      try {
        var SchCode = '', SchName = '', SchIndex = 0;
        jQ(data).find("option").each(function (Index, Item) {
          SchCode = jQ(Item).val();
          SchName = jQ(Item).text();
          if (SchCode.length > 0) {
            SchIndex = parseInt(localStorage.getItem(KeyPrefix + 'Count')) + 1;
            localStorage.setItem(KeyPrefix + SchCode, SchName);
            localStorage.setItem(KeyPrefix + 'Count', SchIndex);
          }
        });
      }
      catch (e) {
        localStorage.setItem(KeyPrefix + ' Error:', e);
      }
    }).fail(function (FailMsg) {
      localStorage.setItem(KeyPrefix + ' Fail:', FailMsg.statusText);
    }).always(function () {
      AjaxPending("Stop");
    });
  };

  /**
   * kp_verify_applicant_list_clg.php?status=10042&schcd=19200301cl
   *
   * @param {type} ClgCode
   * @param {type} fYear
   * @returns {undefined}
   */
  var GetClgAppList = function (ClgCode, fYear, Scheme) {
    localStorage.setItem('Status', 'GetClgAppList: ' + ClgCode);
    var KeyPrefix = localStorage.getItem('KeyPrefix');
    if (Scheme === "K2U") {
      Scheme = "_list_clg_upgradation.php";
    } else {
      Scheme = "_list_clg.php";
    }
    jQ.ajax({
      type: 'GET',
      url: BaseURL + 'admin_pages/kp_verify_applicant' + Scheme,
      dataType: 'html',
      xhrFields: {
        withCredentials: true
      },
      data: {
        'year': fYear,
        'status': '10042',
        'schcd': ClgCode,
        'pending':1
      }
    }).done(function (data) {
      try {
        var AppNo = '', AppName = '', AppCount = 0;
        jQ(data).find("table.tftable tr td:nth-child(2)")
            .each(function (Index, Item) {
              AppNo = jQ(Item).text();
              AppName = jQ(Item).next().text();
              var Finalised = jQ(Item).next().next().text();
              Finalised = "Is " + Finalised;
              if (Finalised.indexOf("FINALIZED") < 0) {
                AppCount = parseInt(localStorage.getItem(KeyPrefix + 'Count')) + 1;
                localStorage.setItem(KeyPrefix + AppNo, AppName);
                localStorage.setItem(KeyPrefix + 'Count', AppCount);
              }
            });
      }
      catch (e) {
        localStorage.setItem(KeyPrefix + ' Error:', e);
      }
    }).fail(function (FailMsg) {
      localStorage.setItem(KeyPrefix + ' Fail:', FailMsg.statusText);
    }).always(function () {
      AjaxPending("Stop");
    });
  };

  /**
   * admin_pages/kp_block_verify_list_clg.php?block_code=192003
   *
   * @param {type} BlockCode
   * @returns {undefined}
   */
  var GetClgList = function (BlockCode) {
    localStorage.setItem('Status', 'GetClgList: ' + BlockCode);
    var KeyPrefix = localStorage.getItem('KeyPrefix');
    jQ.ajax({
      type: 'POST',
      url: BaseURL + 'admin_pages/ajax/find_college_for_block.php',
      dataType: 'html',
      xhrFields: {
        withCredentials: true
      },
      data: {
        'block_code': BlockCode,
        'slc_name': 'schcd'
      }
    }).done(function (data) {
      try {
        var ClgCode = '', Status = 0, ClgIndex = 0;
        jQ(data).find("option").each(function (Index, Item) {
          if (Index > 0) {
            ClgCode = jQ(Item).val();
            ClgName = jQ(Item).text();
            if (ClgCode.length > 0) {
              ClgIndex = parseInt(localStorage.getItem(KeyPrefix + 'Count')) + 1;
              localStorage.setItem(KeyPrefix + ClgCode, ClgName);
              localStorage.setItem(KeyPrefix + 'Count', ClgIndex);
            }
          }
        });
      }
      catch (e) {
        localStorage.setItem(KeyPrefix + ' Error:', e);
      }
    }).fail(function (FailMsg) {
      localStorage.setItem(KeyPrefix + ' Fail:', FailMsg.statusText);
    }).always(function () {
      AjaxPending("Stop");
    });
  };

  /**
   * Get a List of All Institutions
   *
   * @returns {undefined}
   */
  var GetBlockList = function () {
    localStorage.setItem('Status', 'Request Blocks');
    var KeyPrefix = localStorage.getItem('KeyPrefix');
    jQ.ajax({
      type: 'GET',
      url: BaseURL + 'admin_pages/kp_dpmu_verify_block_list.php',
      dataType: 'html',
      xhrFields: {
        withCredentials: true
      }
    }).done(function (data) {
      try {
        var BlockCode = '', BlkIndex = 0;
        jQ(data).find("#block_select option").each(function (Index, Item) {
          BlockCode = jQ(Item).val();
          BlockName = jQ(Item).text();
          if (BlockCode.length > 0) {
            BlkIndex = parseInt(localStorage.getItem(KeyPrefix + 'Count')) + 1;
            localStorage.setItem(KeyPrefix + BlockCode, BlockName);
            localStorage.setItem(KeyPrefix + 'Count', BlkIndex);
          }
        });
        localStorage.setItem('Status', 'Success');
      }
      catch (e) {
        localStorage.setItem(KeyPrefix + ' Error:', e);
      }
    }).fail(function (FailMsg) {
      localStorage.setItem(KeyPrefix + ' Fail:', FailMsg.statusText);
    }).always(function () {
      AjaxPending("Stop");
    });
  };

  /**
   * Load all stored data from localStorage
   * Using the matching pair like Start_Key_End:Value
   * @param {type} Prefix
   * @returns {Array}
   */
  var LoadData = function (Prefix) {
    localStorage.setItem('Status', 'Load: ' + Prefix + '*');
    var Status = [], AllIDs = [];
    jQ.each(localStorage, function (Key, Value) {
      if (Key.search(Prefix) >= 0) {
        var StoredKey = Key.substr(Prefix.length, Key.length - Prefix.length);
        if (StoredKey !== "Count") {
          AllIDs.push(StoredKey);
        }
        Status.push(StoredKey + " => " + Value);
      }
    });
    if (jQ("#AllIDs").val().length === 0) {
      jQ("#AllIDs").val(AllIDs.join(","));
    }
    return Status;
  };

  /**
   * Gets different scheme argument combinations for
   * all pending schools for all schemes
   *
   * @param AllIDs
   * @param Gap
   * @param fYear
   * @param Scheme
   * @constructor
   */
  var PendingSchoolList = function (AllIDs, Gap, fYear, Scheme) {
    jQ.each(AllIDs, function (Index, Value) {
      if (Value.length > 0) {
        setTimeout(function () {
          AjaxFunnel(GetSchListPending, Value, fYear, Scheme);
        }, Gap * Index);
      }
    });
  };

  /**
   * Gets different scheme argument combinations
   * and all pages by using the pending count value
   *
   * @param AllIDs
   * @param Gap
   * @param fYear
   * @param Scheme
   * @constructor
   * @param KeyPrefix
   */
  var PendingSchoolAppList = function (AllIDs, Gap, fYear, Scheme, KeyPrefix) {
    var AppCount = 0;
    jQ.each(AllIDs, function (Index, Value) {
      if (Value.length > 0) {
        AppCount = Number(localStorage.getItem(KeyPrefix + Value));
        for (var i = 0, Page = 1; i < AppCount; i += 5, Page++) {
          setTimeout(AjaxFunnel(GetSchAppList, Value, Scheme, Page, fYear), Gap * (Index + i));
        }
      }
    });
  };

  /**
   * Initiates the Selected Action to be performed
   *
   * @param {String} ForStep
   * @returns {undefined}
   */
  var GoForAction = function (ForStep) {

    var AllIDs = jQ("#AllIDs").val().split(",");
    var fYear = jQ("#OptYear").val();
    var Gap = 250;

    if (ForStep !== "Prepare") {
      jQ("#OptYear").prop("disabled", "disabled");
      jQ("#OptAction").prop("disabled", "disabled");
      jQ("#CmdGo").prop("disabled", "disabled");
    }

    switch (jQ("#OptAction").val()) {
      case "BlockList":
        if (ForStep === "Prepare") {
          localStorage.setItem('KeyPrefix', 'BlkCode_');
        } else {
          localStorage.setItem(localStorage.getItem('KeyPrefix') + 'Count', 0);
          setTimeout(AjaxFunnel(GetBlockList), Gap);
        }
        break;

      case "ClgList":
        if (ForStep === "Prepare") {
          localStorage.setItem('KeyPrefix', 'ClgCode_');
        } else {
          localStorage.setItem(localStorage.getItem('KeyPrefix') + 'Count', 0);
          jQ.each(AllIDs, function (Index, Value) {
            if (Value.length > 0) {
              setTimeout(AjaxFunnel(GetClgList, Value), Gap * Index);
            }
          });
        }
        break;

      case "ClgAppList":
        if (ForStep === "Prepare") {
          localStorage.setItem('KeyPrefix', 'ClgAppNo-' + fYear + '_');
        } else {
          localStorage.setItem(localStorage.getItem('KeyPrefix') + 'Count', 0);
          jQ.each(AllIDs, function (Index, Value) {
            if (Value.length > 0) {
              setTimeout(AjaxFunnel(GetClgAppList, Value, fYear), Gap * Index);
            }
          });
        }
        break;

      case "ClgAppListU":
        if (ForStep === "Prepare") {
          localStorage.setItem('KeyPrefix', 'ClgAppNo-' + fYear + '_');
        } else {
          localStorage.setItem(localStorage.getItem('KeyPrefix') + 'Count', 0);
          jQ.each(AllIDs, function (Index, Value) {
            if (Value.length > 0) {
              setTimeout(AjaxFunnel(GetClgAppList, Value, fYear, "K2U"), Gap * Index);
            }
          });
        }
        break;

      case "SchList":
        if (ForStep === "Prepare") {
          localStorage.setItem('KeyPrefix', 'SchCode-' + fYear + '_');
        } else {
          localStorage.setItem(localStorage.getItem('KeyPrefix') + 'Count', 0);
          jQ.each(AllIDs, function (Index, Value) {
            if (Value.length > 0) {
              setTimeout(AjaxFunnel(GetSchList, Value), Gap * Index);
            }
          });
        }
        break;

      case "SchListP":
        if (ForStep === "Prepare") {
          localStorage.setItem('KeyPrefix', 'SchCode-' + fYear + '_');
        } else {
          PendingSchoolList(AllIDs, Gap, fYear, "K1");
        }
        break;

      case "SchAppList":
        if (ForStep === "Prepare") {
          localStorage.setItem('KeyPrefix', 'SchAppNo-' + fYear + '_');
        } else {
          PendingSchoolAppList(AllIDs, Gap, fYear, "K1", 'SchCode-' + fYear + '_');
        }
        break;

      case "SchListR":
        if (ForStep === "Prepare") {
          localStorage.setItem('KeyPrefix', 'SchCode-' + fYear + '_');
        } else {
          PendingSchoolList(AllIDs, Gap, fYear, "K1R");
        }
        break;

      case "SchAppListR":
        if (ForStep === "Prepare") {
          localStorage.setItem('KeyPrefix', 'SchAppNo-' + fYear + '_');
        } else {
          PendingSchoolAppList(AllIDs, Gap, fYear, "K1R", 'SchCode-' + fYear + '_');
        }
        break;

      case "SchK2ListP":
        if (ForStep === "Prepare") {
          localStorage.setItem('KeyPrefix', 'SchK2Code-' + fYear + '_');
        } else {
          PendingSchoolList(AllIDs, Gap, fYear, "K2");
        }
        break;

      case "SchK2AppList":
        if (ForStep === "Prepare") {
          localStorage.setItem('KeyPrefix', 'SchK2AppNo-' + fYear + '_');
        } else {
          PendingSchoolAppList(AllIDs, Gap, fYear, "K2", 'SchK2Code-' + fYear + '_');
        }
        break;

      case "SchK2ListU":
        if (ForStep === "Prepare") {
          localStorage.setItem('KeyPrefix', 'SchK2Code-' + fYear + '_');
        } else {
          PendingSchoolList(AllIDs, Gap, fYear, "K2U");
        }
        break;

      case "SchK2AppListU":
        if (ForStep === "Prepare") {
          localStorage.setItem('KeyPrefix', 'SchK2AppNo-' + fYear + '_');
        } else {
          PendingSchoolAppList(AllIDs, Gap, fYear, "K2U", 'SchK2Code-' + fYear + '_');
        }
        break;

      case "Finalize":
        if (ForStep === "Prepare") {
          localStorage.setItem('KeyPrefix', 'Finalize-' + fYear + '_');
        } else {
          localStorage.setItem(localStorage.getItem('KeyPrefix') + 'Count', 0);
          jQ.each(AllIDs, function (Index, Value) {
            if (Value.length > 0) {
              setTimeout(AjaxFunnel(FinalizeAppID, Value, fYear), Gap * Index);
            }
          });
        }
        break;

      case "AddToSanction":
        var OrderNo = localStorage.getItem('OrderNo');

        if (ForStep === "Prepare") {
          localStorage.setItem('KeyPrefix', 'AddToSanction-' + fYear + '_');
          if (OrderNo === null) {
            localStorage.setItem('OrderNo', jQ("#AllIDs").val());
            OrderNo = localStorage.getItem('OrderNo');
            jQ("#AllIDs").val('');
          }
          if (OrderNo === '') {
            jQ("#Info").html('Sanction OrderNo. is Mandatory!');
            jQ("#AllIDs").val('');
          } else if (OrderNo.length > 0) {
            jQ("#Info").html('Sanction Order No.: ' + OrderNo);
            var reCaptchaUI = '<img id="captcha" class="captcha_image" src="../captcha/captcha.php">'
                + '<br/><input id="captchaCode" style="width: 120px;"/>';
            jQ("#reCaptcha").html(reCaptchaUI).show();
          }
        } else {
          localStorage.setItem(localStorage.getItem('KeyPrefix') + 'Count', 0);
          if (OrderNo.length === 14) {
            setTimeout(AjaxFunnel(AddToSanction, fYear), Gap * Index);
          } else {
            jQ("#Info").html('Sanction OrderNo. is Required!');
          }
        }
        break;

      case "RejectApp":
        if (ForStep === "Prepare") {
          localStorage.setItem('KeyPrefix', 'Reject_');
        } else {
          localStorage.setItem(localStorage.getItem('KeyPrefix') + 'Count', 0);
          jQ.each(AllIDs, function (Index, Value) {
            if (Value.length > 0) {
              setTimeout(AjaxFunnel(RejectAppID, Value), Gap * Index);
            }
          });
        }
        break;
    }
  };

  /**
   * Prepare for Selected Action
   */
  jQ("#OptAction").change(function () {
    GoForAction("Prepare");
  });

  /**
   * Perform the Selected Action
   */
  jQ("#CmdGo").click(function () {
    jQ("#CmdClear").trigger("click");
    GoForAction("Perform");
  });

  /**
   * Loads the contents of localStorage into the interface
   */
  jQ("#CmdStatus").click(function () {
    if (jQ("#CmdStatus").val() === "Show") {
      jQ("#CmdStatus").val("Load");
      jQ("#AllIDs").hide();
      var vals = LoadData(localStorage.getItem('KeyPrefix'));
      var StatusDiv = document.createElement("div");
      StatusDiv.setAttribute("id", "AppStatus");
      jQ("#AllIDs").parent().append(StatusDiv);

      jQ("#AppStatus")
          .html("<ol><li>" + vals.join("</li><li>") + "</li></ol>")
          .css({"text-align": "left", "clear": "both"});

      jQ("#AppStatus li").css("list-style-type", "decimal-leading-zero");
    } else {
      jQ("#AppStatus").remove();
      jQ("#AllIDs").show();
      jQ("#CmdStatus").val("Show");
    }
  });

  /**
   * Clear Individual Contents of localStorage
   */
  jQ("#CmdClear").click(function () {
    var Prefix = localStorage.getItem('KeyPrefix');
    jQ.each(localStorage, function (Key) {
      if (Key.search(Prefix) >= 0) {
        localStorage.removeItem(Key);
      }
    });
    localStorage.setItem(Prefix + 'Count', 0);
  });

  /**
   * Clear Contents of the TextArea containing IDs
   */
  jQ("#CmdClearIDs").click(function () {
    var SanctionNo = jQ("#AllIDs").val();
    var fYear = jQ("#OptYear").val();
    var Prefix = localStorage.getItem('KeyPrefix');
    if ((SanctionNo.length == 14) && (Prefix == "Finalize-" + fYear + "_")) {
      localStorage.setItem('OrderNo', SanctionNo);
    }
    jQ("#AllIDs").val("");
  });

  /**
   * Clears all the contents of localStorage
   */
  jQ("#CmdClearStorage").click(function () {
    var fYear = jQ("#OptYear").val();
    localStorage.clear();
    localStorage.setItem('AjaxPending', 0);
    localStorage.setItem('BlkCode_Count', 0);
    localStorage.setItem('ClgCode_Count', 0);
    localStorage.setItem('SchCode-' + fYear + '_Count', 0);
    localStorage.setItem('SchK2Code-' + fYear + '_Count', 0);
    localStorage.setItem('ClgAppNo-' + fYear + '_Count', 0);
    localStorage.setItem('SchAppNo-' + fYear + '_Count', 0);
    localStorage.setItem('SchK2AppNo-' + fYear + '_Count', 0);
    localStorage.setItem('SanctionCount', 0);
    jQ("#OptAction").trigger("change");
  });

  /**
   * Reset Counters to 0 if not set after localStorage is cleared
   */
  jQ("#OptYear").change(function () {
    var fYear = jQ(this).val();
    if (!localStorage.getItem('SchCode-' + fYear + '_Count')) {
      localStorage.setItem('SchCode-' + fYear + '_Count', 0);
    }
    if (!localStorage.getItem('SchK2Code-' + fYear + '_Count')) {
      localStorage.setItem('SchK2Code-' + fYear + '_Count', 0);
    }
    if (!localStorage.getItem('ClgAppNo-' + fYear + '_Count')) {
      localStorage.setItem('ClgAppNo-' + fYear + '_Count', 0);
    }
    if (!localStorage.getItem('SchAppNo-' + fYear + '_Count')) {
      localStorage.setItem('SchAppNo-' + fYear + '_Count', 0);
    }
    if (!localStorage.getItem('SchK2AppNo-' + fYear + '_Count')) {
      localStorage.setItem('SchK2AppNo-' + fYear + '_Count', 0);
    }
  });

  /**
   * Continious Polling for Server Response to avoid Session TimeOut
   *
   * @returns {Boolean}
   */
  var RefreshOnWait = function () {
    var CurrDate = new Date(), TimeOut;
    var LastRespTime = new Date(localStorage.getItem("LastRespTime"));
    var ElapsedTime = CurrDate.getTime() - LastRespTime.getTime();
    TimeOut = localStorage.getItem("RefreshTimeOut");
    if (TimeOut === null) {
      TimeOut = 300000;
    } else {
      TimeOut = 5000 + 60000 * TimeOut; // 5sec is minimum
    }

    if (ElapsedTime > TimeOut) {
      localStorage.setItem("LastRespTime", Date());
      var URL = BaseURL + "admin_pages/kp_homepage.php";
      jQ.get(URL);
    } else {
      var fYear = jQ("#OptYear").val();
      jQ("#Msg").html('AjaxPending :<span>'
          + localStorage.getItem('AjaxPending')
          + '</span><br/>Blocks :<span>'
          + localStorage.getItem('BlkCode_Count')
          + '</span><br/>Colleges :<span>'
          + localStorage.getItem('ClgCode_Count')
          + '</span><br/>College Applications :<span>'
          + localStorage.getItem('ClgAppNo-' + fYear + '_Count')
          + '</span><br/>Schools :<span>'
          + localStorage.getItem('SchCode-' + fYear + '_Count')
          + '</span><br/>Schools K2 :<span>'
          + localStorage.getItem('SchK2Code-' + fYear + '_Count')
          + '</span><br/>School Applications :<span>'
          + localStorage.getItem('SchAppNo-' + fYear + '_Count')
          + '</span><br/>School K2 Applications :<span>'
          + localStorage.getItem('SchK2AppNo-' + fYear + '_Count')
          + '</span><br/><br/>Sanction OrderNo :<b>'
          + localStorage.getItem('OrderNo')
          + '</b><br/><br/><b>Last API('
          + localStorage.getItem('KeyPrefix')
          + ') : </b>'
          + localStorage.getItem('Status')
          + '<br/><br/>' + localStorage.getItem('LastRespTime'));

      if (localStorage.getItem('AjaxPending') === "0") {
        jQ("#OptYear").removeProp("disabled");
        jQ("#OptAction").removeProp("disabled");
        jQ("#CmdGo").removeProp("disabled");
      }

      jQ("#Msg span").css({
        "width": "80px",
        "display": "inline-block"
      });
    }
    setTimeout(RefreshOnWait, 2000);
    return true;
  };

  RefreshOnWait();

  localStorage.setItem("LastRespTime", Date());
});
