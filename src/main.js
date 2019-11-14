// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

import firebase from 'firebase'

import "@/assets/global.css"


Vue.config.productionTip = false

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "*****************",
  authDomain: "*****************",
  databaseURL: "*****************",
  projectId: "*****************",
  storageBucket: "",
  messagingSenderId: "*****************",
  appId: "*****************",
  measurementId: "***********"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);


new Vue({
  el: '#app',
  router,
  components: {
    App
  },
  template: '<App/>'
})
