<template>
    <section>
        <div class="ui middle aligned center aligned grid">
            <div class="column">
                <h1>Driver</h1>
                <p v-if="user">User:{{user.email}}</p>
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
                    this.$router.push("/login");
                });
        }
    }
};
</script>

