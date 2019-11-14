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

