angular.module('tropicalDiary.controllers', ['ionic', 'tropicalDiary.controllers'])


.factory('PersonService', function($http, $rootScope){
  var items = [];

  return {

    GetFeed: function(){

      console.log("In Get Feed");
      console.log("token: " + $rootScope.token);


      return $http.get('https://tropical-diary-api.mybluemix.net/api/Activities?access_token='+$rootScope.token).then(function(response){

        console.log(JSON.stringify(response));
        items = response.data;
	return items;
      });
    },

    GetNewUsers: function(){
      return $http.get(BASE_URL+'?results=2').then(function(response){
        items = response.data.results;
	return items;
      });
    },

    GetOldUsers: function(){
      return $http.get(BASE_URL+'?results=10').then(function(response){
        items = response.data.results;
	return items;
      });
    }
  }
})

.service('LoginService', function($q, $http) {
  return {
    loginUser: function(name, pw) {
      var deferred = $q.defer();
      var promise = deferred.promise;

      console.log('username: ' + name + ', pass: ' + pw);

      $http.post('https://tropical-diary-api.mybluemix.net/api/TropicalUsers/login','{"email":"'+name+'", "password":"'+pw+'"}').then(function(resp) {

        //console.log('Success', JSON.stringify(resp));
        deferred.resolve(resp);
      }, function(err) {
        //console.error('ERR', JSON.stringify(err));
        deferred.reject('Wrong credentials.');
      })

      promise.success = function(fn) {
        promise.then(fn);
        return promise;
      }

      promise.error = function(fn) {
        promise.then(null, fn);
        return promise;
      }

     return promise;
    }
  }
})

.controller('LoginCtrl', function($scope, $rootScope, LoginService, $ionicPopup, $state) {
  console.log("in login");
  $scope.data = {};
  $scope.data.username = "admin@tropical.com";
  $scope.data.password = "xxx";

  $scope.login = function() {
    LoginService.loginUser($scope.data.username, $scope.data.password).success(function(data) {
      //console.log('heres the data ' + data.data);
      $rootScope.token = data.data.id;


      $state.go('newsFeed');
    }).error(function(data) {
      var alertPopup = $ionicPopup.alert({
        title: 'Login failed!',
        template: 'Please check your credentials!'
      });
    });
  }
})


.controller('CaptureCtrl', function($scope, $rootScope, $ionicModal, $location, $timeout, $state, $http, $cordovaDevice, $cordovaFile, $ionicPlatform, $cordovaEmailComposer, $ionicActionSheet, ImageService, FileService) {
  console.log("In Capture Ctrl");

   $scope.currentEntry = {};


   $http.get('https://tropical-diary-api.mybluemix.net/api/Diaries').then(function(resp) {

     console.log('Success', resp);
     // For JSON responses, resp.data contains the result
     $scope.diaries = resp.data;

   }, function(err) {
     console.error('ERR', err);
     // err.status will contain the status code
   });


  $scope.mainMenu = function() {
    console.log('Cancel Pressed');
    $state.go('captureImage');
  };

  $scope.captureImage = function() {
    console.log('captureImage Pressed');
    $state.go('captureImage');
  };

  $scope.saveEntry = function() {
    console.log('Save Pressed');
    console.log( JSON.stringify($scope.currentEntry));

    var entry = {
      session: $scope.currentEntry.session,
      name: $scope.currentEntry.activityName,
      isPublished: "true",
      userId: "string",
      diaryId: $scope.currentEntry.diary.id,
      imageUrl: "https://www.goodshepherds.net/home/180005716/180006159/images/art_fair_painting_children_bingfree.jpg",
      description: $scope.currentEntry.description,
      startTime: "2016-01-25",
      endTime: "2016-01-25"
}

var url = 'https://tropical-diary-api.mybluemix.net/api/Activities?access_token=' + $rootScope.token;
$http.post(url, entry).then(function(resp) {
  console.log('Success', resp);
  // For JSON responses, resp.data contains the result
  $scope.diaries = resp.data;

}, function(err) {
  console.error('ERR', err);
  // err.status will contain the status code
});

  console.log( "here is the entry - " + JSON.stringify(entry));

    $state.go('newsFeed');
  };


  $ionicPlatform.ready(function() {
    $scope.images = FileService.images();
    //$scope.$apply();
  });

  $scope.urlForImage = function(imageName) {
    var trueOrigin = cordova.file.dataDirectory + imageName;
    return trueOrigin;
  }

  $scope.addMedia = function() {
    console.log('Pressed Add Media');
    $scope.hideSheet = $ionicActionSheet.show({
      buttons: [
        { text: 'Take photo' },
        { text: 'Photo from library' }
      ],
      titleText: 'Add images',
      cancelText: 'Cancel',
      buttonClicked: function(index) {
        $scope.addImage(index);
      }
    });
  }

  $scope.addImage = function(type) {
    console.log('Pressed Add Image');
    $scope.hideSheet();
    ImageService.handleMediaDialog(type).then(function() {
      //$scope.$apply();
    });
  }

  $scope.sendEmail = function() {
    if ($scope.images != null && $scope.images.length > 0) {
      var mailImages = [];
      var savedImages = $scope.images;
      if ($cordovaDevice.getPlatform() == 'Android') {
        // Currently only working for one image..
        var imageUrl = $scope.urlForImage(savedImages[0]);
        var name = imageUrl.substr(imageUrl.lastIndexOf('/') + 1);
        var namePath = imageUrl.substr(0, imageUrl.lastIndexOf('/') + 1);
        $cordovaFile.copyFile(namePath, name, cordova.file.externalRootDirectory, name)
        .then(function(info) {
          mailImages.push('' + cordova.file.externalRootDirectory + name);
          $scope.openMailComposer(mailImages);
        }, function(e) {
          reject();
        });
      } else {
        for (var i = 0; i < savedImages.length; i++) {
          mailImages.push('' + $scope.urlForImage(savedImages[i]));
        }
        $scope.openMailComposer(mailImages);
      }
    }
  }

  $scope.openMailComposer = function(attachments) {
    var bodyText = '<html><h2>My Images</h2></html>';
    var email = {
        to: 'some@email.com',
        attachments: attachments,
        subject: 'Devdactic Images',
        body: bodyText,
        isHtml: true
      };

    $cordovaEmailComposer.open(email).then(null, function() {
      for (var i = 0; i < attachments.length; i++) {
        var name = attachments[i].substr(attachments[i].lastIndexOf('/') + 1);
        $cordovaFile.removeFile(cordova.file.externalRootDirectory, name);
      }
    });
  }





})

.controller('NewsFeedCtrl', function($scope, $rootScope, $timeout, $ionicSideMenuDelegate, PersonService) {

  console.log("In News Feed Ctrl");

  $scope.items = [];
  $scope.newItems = [];

  $scope.toggleLeft = function() {
    console.log("TOGGLE LEFT");
    $ionicSideMenuDelegate.toggleLeft();
  };

  PersonService.GetFeed().then(function(items){
    $scope.items = items;
    console.log("HERE ARE THE ITEMS " + JSON.stringify(items));
  });


  $scope.loadMore = function(){
    console.log("load more");
    //PersonService.GetOldUsers().then(function(items) {
    //  $scope.items = $scope.items.concat(items);
    //  $scope.$broadcast('scroll.infiniteScrollComplete');
    //});
  };


  $scope.doRefresh = function(){
    console.log('Refresh');
    PersonService.GetFeed().then(function(items){
      $scope.items = items;
    })
    .finally(function(){
      $scope.$broadcast('scroll.refreshComplete')
    });
  };


  $scope.mainMenu = function() {
    console.log('Capture Pressed');
    $state.go('capture');
  };

  var CheckNewItems = function(){
   // $timeout(function(){
   //   PersonService.GetNewUsers().then(function(items){
   //     $scope.newItems = items.concat($scope.newItems);
   //     CheckNewItems();
   //   });
   // },10000);
  }

//CheckNewItems();


})
.controller('ImageController', function($scope, $cordovaDevice, $cordovaFile, $ionicPlatform, $cordovaEmailComposer, $ionicActionSheet, ImageService, FileService) {

  console.log('In Image COntroller');

  $ionicPlatform.ready(function() {
    $scope.images = FileService.images();
    //$scope.$apply();
  });

  $scope.urlForImage = function(imageName) {
    var trueOrigin = cordova.file.dataDirectory + imageName;
    return trueOrigin;
  }

  $scope.addMedia = function() {
    console.log('Pressed Add Media');
    $scope.hideSheet = $ionicActionSheet.show({
      buttons: [
        { text: 'Take photo' },
        { text: 'Photo from library' }
      ],
      titleText: 'Add images',
      cancelText: 'Cancel',
      buttonClicked: function(index) {
        $scope.addImage(index);
      }
    });
  }

  $scope.addImage = function(type) {
    console.log('Pressed Add Image');
    $scope.hideSheet();
    ImageService.handleMediaDialog(type).then(function() {
      //$scope.$apply();
    });
  }

  $scope.sendEmail = function() {
    if ($scope.images != null && $scope.images.length > 0) {
      var mailImages = [];
      var savedImages = $scope.images;
      if ($cordovaDevice.getPlatform() == 'Android') {
        // Currently only working for one image..
        var imageUrl = $scope.urlForImage(savedImages[0]);
        var name = imageUrl.substr(imageUrl.lastIndexOf('/') + 1);
        var namePath = imageUrl.substr(0, imageUrl.lastIndexOf('/') + 1);
        $cordovaFile.copyFile(namePath, name, cordova.file.externalRootDirectory, name)
        .then(function(info) {
          mailImages.push('' + cordova.file.externalRootDirectory + name);
          $scope.openMailComposer(mailImages);
        }, function(e) {
          reject();
        });
      } else {
        for (var i = 0; i < savedImages.length; i++) {
          mailImages.push('' + $scope.urlForImage(savedImages[i]));
        }
        $scope.openMailComposer(mailImages);
      }
    }
  }

  $scope.openMailComposer = function(attachments) {
    var bodyText = '<html><h2>My Images</h2></html>';
    var email = {
        to: 'some@email.com',
        attachments: attachments,
        subject: 'Devdactic Images',
        body: bodyText,
        isHtml: true
      };

    $cordovaEmailComposer.open(email).then(null, function() {
      for (var i = 0; i < attachments.length; i++) {
        var name = attachments[i].substr(attachments[i].lastIndexOf('/') + 1);
        $cordovaFile.removeFile(cordova.file.externalRootDirectory, name);
      }
    });
  }
});
