/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
// import * as cordova from "../../plugins/cordova-plugin-file/www/fileSystemPaths";


let app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    onDeviceReady: function() {

       kits.getKits();
    },
};


let kits = {
  getKits: function () {
      $.ajax({
          type: "GET",
          url: "http://danielfotografo.altervista.org/smartTrack/php/ajax/get_all_kits.php",
      }).done(function (data) {
          console.log(data);
          alert('kit getted ');
          alert(data);
      }).fail(function (a, b, c) {
          console.log('fail: ' + b + '|' + c );
          alert('fail');
      });
  }
};

$(document).ready( function () {
    app.initialize();
});