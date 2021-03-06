// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('tropicalDiary', ['ionic', 'ngCordova', 'tropicalDiary.controllers'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $locationProvider)
{

//$locationProvider.html5Mode({enabled: true, requireBase: false}).hashPrefix("!");

  $stateProvider

  .state('login', {
    url: "/login",
    templateUrl: "templates/login.html",
    controller: 'LoginCtrl'
  })

  .state('capture', {
    url: "/capture",
    templateUrl: "templates/capture.html",
    controller: 'CaptureCtrl'
  })

  .state('newsFeed', {
    url: "/newsFeed",
    templateUrl: "templates/newsFeed.html",
    controller: 'NewsFeedCtrl'
  })
  .state('captureImage', {
    url: "/captureImage",
    templateUrl: "templates/captureImage.html",
    controller: 'ImageController'
  })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');

});
