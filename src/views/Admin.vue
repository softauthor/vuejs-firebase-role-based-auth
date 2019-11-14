<template>
    <section>
        <div class="ui middle aligned center aligned grid">
            <div class="column">
                <h1>Admin</h1>
                <p v-if="user">User:{{user.email}}</p>
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
                    console.log(error);
                });
        }
    }
};
</script>