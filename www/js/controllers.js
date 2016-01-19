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

      $http.post('http://tropical-diary-api.mybluemix.net/api/TropicalUsers/login','{"email":"'+name+'", "password":"'+pw+'"}').then(function(resp) {

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


.controller('CaptureCtrl', function($scope, $ionicModal, $location, $timeout, $state, $http) {
  console.log("In Capture Ctrl");

   $scope.currentEntry = {};

   $http.get('https://tropical-diary-api.mybluemix.net/api/Infants').then(function(resp) {
     console.log('Success', resp);
     // For JSON responses, resp.data contains the result
     $scope.infants = resp.data;

   }, function(err) {
     console.error('ERR', err);
     // err.status will contain the status code
   })


  $scope.mainMenu = function() {
    console.log('Cancel Pressed');
    $state.go('app');
  };


  $scope.saveEntry = function() {
    console.log('Save Pressed');
    console.log( $scope.currentEntry);
    $state.go('app');
  };

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


