# Vue.js + Firebase: Role-Based Authentication / Authorization in a nutshell

In this article, you’re going to learn how to set user roles using Auth Custom Claims and store user data to the Cloud Firestore when a new Firebase user account is created. 

Then, I will be showing you how to guard vue routes based on user role when signing in. 

Finally, I will teach you how to get all the user accounts at once when signed in user has admin privileges and change user roles using Firebase callable function.

Here are the 3 roles:

- The **admin** role will have access to all the users stored on the database and will be given permission to change user roles using Security Rules.
- The **Driver** role will have access to Driver View.
- The **customer** role will have access to Customer View and it will be set default role as most of the users will be under this role.

Sounds Interesting…Let’s get learning.

1. [Up and Running Vue Project](https://softauthor.com/vue-js-firebase-role-based-authentication/#up-and-running-vue-project)
2. [Create A Firebase User Account](https://softauthor.com/vue-js-firebase-role-based-authentication/#create-a-firebase-user-account)
3. [Add Admin Auth Custom Claims](https://softauthor.com/vue-js-firebase-role-based-authentication/#add-admin-auth-custom-claims)
4. [Login User](https://softauthor.com/vue-js-firebase-role-based-authentication/#login-user)
5. [Auth Guard for Authorization](https://softauthor.com/vue-js-firebase-role-based-authentication/#vue-auth-guard-for-authorization)
6. [Customer / Driver View](https://softauthor.com/vue-js-firebase-role-based-authentication/#customer-driver-view)
7. [Change User Roles](https://softauthor.com/vue-js-firebase-role-based-authentication/#change-user-roles)


![Infographics](https://softauthor.com/wp-content/uploads/2019/11/vuejs-firebase-role-based-authentication-authorization-1.png)


## 1.Up and Running Vue Project

I have created a starter project using vue cli webpack and created five page based components under src/views folder as well as routes for them. 


router/index.js
``` javascript

import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/views/Login'
import Register from '@/views/Register'
import Admin from '@/views/Admin'
import Driver from '@/views/Driver'
import Customer from '@/views/Customer'

Vue.use(Router)

let router = new Router({
  routes: [{
      path: '/register',
      name: 'register',
      component: Register,
      meta: {
        guest: true
      }
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: {
        guest: true
      }
    },
    {
      path: '/admin',
      name: 'admin',
      component: Admin,
      meta: {
        auth: true
      }
    },
    {
      path: '/driver',
      name: 'driver',
      component: Driver,
      meta: {
        auth: true
      }
    },
    {
      path: '/customer',
      name: 'customer',
      component: Customer,
      meta: {
        auth: true
      }
    },
  ],
})
export default router
```

Run the project.

npm install
npm run dev

## 2.Create A Firebase User Account 
Go ahead and create a project on the Firebase Console and include the initialization code inside the main.js file.

main.js
``` javascript
import firebase from 'firebase'<br><br>// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "**************",
  authDomain: "**************",
  databaseURL: "**************",
  projectId: "**************",
  storageBucket: "",
  messagingSenderId: "**************",
  appId: "**************",
  measurementId: "**************"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
```

Let’s create a registration form. I use semantic UI but feel free to use your favorite. I have included CDN link in the index.html file.


## 3.Register.vue

``` html
<template>
    <div class="ui middle aligned center aligned grid">
        <div class="column">
            <form class="ui large form">
                <div class="ui stacked secondary segment">
                    <div class="field"></div>
                    <div class="field">
                        <div class="ui left icon input large">
                            <i class="mail icon"></i>
                            <input
                                type="text"
                                name="email"
                                placeholder="E-mail address"
                                v-model="email"
                            />
                        </div>
                    </div>
                    <div class="field">
                        <div class="ui left icon input large">
                            <i class="lock icon"></i>
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                v-model="password"
                            />
                        </div>
                    </div>
                    <div
                        class="ui fluid large pink submit button"
                        @click="registerButtonPressed"
                    >Register</div>
                </div>
                <div class="ui error message"></div>
            </form>
            <div class="ui message">
                Have an account already?
                <router-link :to="{ name: 'login' }">Login</router-link>
            </div>
        </div>
    </div>
</template>
<script>
import firebase from "firebase";
export default {
    data() {
        return {
            email: "",
            password: ""
        };
    },
    methods: {
        async registerButtonPressed() {
            try {
                var {
                    user
                } = await firebase
                    .auth()
                    .createUserWithEmailAndPassword(this.email, this.password);
                // signout
                firebase
                    .auth()
                    .signOut()
                    .then(user => {
                        this.$router.push("/login");
                    });
            } catch (error) {
                console.log(error.message);
            }
        }
    }
};
</script>
```

If it’s not working, make sure to enable Email/Password from the sign-in methods tab on the Firebase Authentication Page.

When the user role is set via auth custom claims, it will become available after signing out and signing back in.

For that reason, I have signout functionality below after creating a new user account. If you have any better solution than this, please let me know in the comment section below.

## 4. Add Admin Auth Custom Claims
As you know it’s not a good idea to set the admin role from the client, so I will be using Firebase Cloud Functions to add that.

I assume that you already know how to get up and running with Firebase Cloud Functions.

AddUserRole() function will be triggered when a new Firebase user account is created.

functions/index.js 
``` javascript
exports.AddUserRole = functions.auth.user().onCreate(async (authUser) => {
  if (authUser.email) {
    const customClaims = {
      admin: true,
    };
    try {
      var _ = await admin.auth().setCustomUserClaims(authUser.uid, customClaims)
      return db.collection("roles").doc(authUser.uid).set({
        email: authUser.email,
        role: customClaims
      })
    } catch (error) {
      console.log(error)
    }
  }
});

```

Also, store user data to the Cloud Firestore under roles collection. This way, you can get all the user information later when having admin privileges.

## 5. Login User

Let’s log in to the admin account.

Login.vue
```html

<template>
    <div class="ui middle aligned center aligned grid">
        <div class="column">
            <form class="ui large form">
                <div class="ui stacked secondary segment">
                    <div class="field">
                        <div class="ui left icon input large">
                            <i class="user icon"></i>
                            <input
                                type="text"
                                name="email"
                                placeholder="E-mail address"
                                v-model="email"
                            />
                        </div>
                    </div>
                    <div class="field">
                        <div class="ui left icon input large">
                            <i class="lock icon"></i>
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                v-model="password"
                            />
                        </div>
                    </div>
                    <div class="ui fluid large teal submit button" @click="loginButtonPressed">Login</div>
                </div>
                <div class="ui error message"></div>
            </form>
            <div class="ui message">
                Don't have an account?
                <router-link :to="{ name: 'register' }">Register</router-link>
                <!-- <button @click="signOut">SignOut</button> -->
            </div>
        </div>
    </div>
</template>
<script>
import firebase from "firebase";
export default {
    data() {
        return {
            email: "",
            password: ""
        };
    },
    created() {
        firebase.auth().onAuthStateChanged(userAuth => {
            if (userAuth) {
                firebase
                    .auth()
                    .currentUser.getIdTokenResult()
                    .then(tokenResult => {
                        console.log(tokenResult.claims);
                    });
            }
        });
    },
    methods: {
        async loginButtonPressed() {
            try {
                const {
                    user
                } = await firebase
                    .auth()
                    .signInWithEmailAndPassword(this.email, this.password);
            } catch (error) {
                console.log(error);
            }
        }
    }
};
</script>
```

When you log in with the user you have already created, you will be able to see the admin property is set to true inside the custom claims object.

Nice! However, I do not want to give admin access to all the newly created user accounts.

For that, go to AddUserRole() function on the back-end, replace admin property to the customer in the custom claims object.

Make sure to redeploy the function. 🙂

The reason I use the customer role as default because I assume most of my users come under that role.

Perfect!

You may wonder what if I want to change roles, such as a customer to the driver to a specific user later?

Yes, I will cover that just in a moment.

It’s obvious redirecting the user to an admin view when signing in.

## 6. Auth Guard for Authorization
Inside the beforeEach method, I am checking to see if a user is logged in or not using the onAuthStateChanged method.

If there is a user, get an idTokeResult that has the claims object in which I can get the user role that was set when creating a new user account.

router/index.js
``` javascript
router.beforeEach((to, from, next) => {
  firebase.auth().onAuthStateChanged(userAuth => {
    if (userAuth) {
      firebase.auth().currentUser.getIdTokenResult()
        .then(function ({
          claims
        }) {
          if (claims.customer) {
            if (to.path !== '/customer')
              return next({
                path: '/customer',
              })
          } else if (claims.admin) {
            if (to.path !== '/admin')
              return next({
                path: '/admin',
              })
          } else if (claims.driver) {
            if (to.path !== '/driver')
              return next({
                path: '/driver',
              })
          }
        })
    } else {
      if (to.matched.some(record => record.meta.auth)) {
        next({
          path: '/login',
          query: {
            redirect: to.fullPath
          }
        })
      } else {
        next()
      }
    }
  })
  next()
})

```
Nice!

## 7.Customer View
This view has a simple heading, user email and sign out button and the driver view is identical except for the heading text.

``` html
<template>
    <section>
        <div class="ui middle aligned center aligned grid">
            <div class="column">
                <h1>Customer</h1>
                <p v-if="user">Customer:{{user.email}}</p>
                <button class="ui pink submit button" @click="signout">Signout</button>
            </div>
        </div>
    </section>
</template>
<script>
import firebase from "firebase";
export default {
    data() {
        return {
            user: null
        };
    },
    created() {
        var self = this;
        firebase.auth().onAuthStateChanged(function(user) {
            self.user = user;
        });
    },
    methods: {
        signout() {
            firebase
                .auth()
                .signOut()
                .then(user => {
                    // this.$store.commit("setUser", null);
                    this.$router.push("/login");
                });
        }
    }
};
</script>
```
## 8. Change User Roles

Let’s get all the user accounts when the admin account is logged in so that you can change roles to any user from the front end.

Admin.vue
``` html
<template>
    <section>
        <div class="ui middle aligned center aligned grid">
            <div class="column">
                <h1>Admin</h1>
                <p>User:{{user.email}}</p>
                <button class="ui pink submit button" @click="signout">Signout</button>
                <table class="ui celled table">
                    <thead>
                        <tr>
                            <th>Email</th>
                            <th>Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="user in users" :key="user.id">
                            <td data-label="Name">{{user.email}}</td>
                            <select @change="changeRole(user.id, $event)">
                                <option :selected="user.role.driver" value="driver">Driver</option>
                                <option :selected="user.role.customer" value="customer">Customer</option>
                            </select>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </section>
</template>
<script>
import firebase from "firebase";
export default {
    data() {
        return {
            users: [],
            user: null
        };
    },
    created() {
        var self = this;
        firebase.auth().onAuthStateChanged(function(user) {
            self.user = user;
        });
        this.users = [];
        firebase
            .firestore()
            .collection("roles")
            .get()
            .then(snap => {
                snap.forEach(doc => {
                    var user = doc.data();
                    user.id = doc.id;
                    console.log(doc.data());
                    if (!user.role.admin) this.users.push(user);
                });
            });
    },
    methods: {
        signout() {
            firebase
                .auth()
                .signOut()
                .then(user => {
                    this.$router.push("/login");
                });
        },
        changeRole(uid, event) {
            var addMessage = firebase.functions().httpsCallable("setUserRole");
            var data = { uid: uid, role: { [event.target.value]: true } };
            addMessage(data)
                .then(function(result) {
                    console.log(result);
                })
                .catch(function(error) {
                    console.log(error)
                });
        }
    }
};
</script>
```
Let’s add security rules to the database level. Only admin will be able to get to see all user data from the roles collection inside created() method. 
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
     match /roles/{uid} {
      allow read, write: if request.auth.token.admin == true
    }
    
  }
}
```
Now, add a drop-down menu next to each user with the roles they can switch to and send uid and new role data to the callable function called setUserRole() on the backend.


functions/index.js

``` javascript
exports.setUserRole = functions.https.onCall(async (data, context) => {
  if (!context.auth.token.admin) return
  try {
    var _ = await admin.auth().setCustomUserClaims(data.uid, data.role)
    return db.collection("roles").doc(data.uid).update({
      role: data.role
    })
  } catch (error) {
    console.log(error)
  }
});
```
First, check to see if the request was made by an admin using custom claims on the server-side. Then, set a new role to the custom claims object by uid as well as update the corresponding document to reflect the role change.
