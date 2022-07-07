package com.example.recipez;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.tasks.Task;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Map;

public class LoginActivity extends AppCompatActivity {
    final static String TAG = "LoginActivity";
    private Button signInButton;
    private GoogleSignInClient mGoogleSignInClient;
    private SharedPreferences sharedpreferences;
    private Integer RC_SIGN_IN = 1;
    UserAccount newUser = new UserAccount();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        sharedpreferences = this.getSharedPreferences("UserData", Context.MODE_PRIVATE);


        // Configure sign-in to request the user's ID, email address, and basic
        // profile. ID and basic profile are included in DEFAULT_SIGN_IN.
        GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestEmail()
                .build();

        mGoogleSignInClient = GoogleSignIn.getClient(this, gso);

        // Check for existing Google Sign In account, if the user is already signed in
        // the GoogleSignInAccount will be non-null.
        GoogleSignInAccount account = GoogleSignIn.getLastSignedInAccount(this);
        if (account != null) {
            newUser.signIn(account.getEmail());
            Intent mainActivityIntent = new Intent(LoginActivity.this, MainActivity.class);
            startActivity(mainActivityIntent);
        }

        findViewById(R.id.sign_in_button).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                signIn();
            }
        });
    }

    private void signIn() {
        Intent signInIntent = mGoogleSignInClient.getSignInIntent();
        startActivityForResult(signInIntent, RC_SIGN_IN);
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        // Result returned from launching the Intent from GoogleSignInClient.getSignInIntent(...);
        if (requestCode == RC_SIGN_IN) {
            // The Task returned from this call is always completed, no need to attach
            // a listener.
            Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(data);
            handleSignInResult(task);
        }
    }

    private void handleSignInResult(Task<GoogleSignInAccount> completedTask) {
        try {
            GoogleSignInAccount account = completedTask.getResult(ApiException.class);

            // Signed in successfully, show authenticated UI.
            updateUI(account);
        } catch (ApiException e) {
            // The ApiException status code indicates the detailed failure reason.
            // Please refer to the GoogleSignInStatusCodes class reference for more information.
            Log.w(TAG, "signInResult:failed code=" + e.getStatusCode());
            updateUI(null);
        }
    }

    private void updateUI(GoogleSignInAccount account) {
        if (account == null) {
            Log.d(TAG, "There is no user signed in!");
        } else {
            // sign in was successful
            Log.d(TAG, "Pref Name: " + account.getDisplayName());
            // Log.d(TAG, "Email Name: " + account.getEmail());
            // Log.d(TAG, "Given Name: " + account.getGivenName());
            // Log.d(TAG, "Family Name: " + account.getFamilyName());
            Log.d(TAG, "Display Picture: " + account.getPhotoUrl());
            newUser.signIn(account.getEmail());
            Intent mainActivityIntent = new Intent(LoginActivity.this, MainActivity.class);
            startActivity(mainActivityIntent);
        }
    }

    public String encodeString(String s) {
        String result;
        try {
            result = URLEncoder.encode(s, "UTF-8").replaceAll("\\+", "%20").replaceAll("\\%21", "!")
                    .replaceAll("\\%27", "'").replaceAll("\\%28", "(").replaceAll("\\%29", ")")
                    .replaceAll("\\%7E", "~");
        } // This exception should never occur.
        catch (Exception e) {
            result = s;
        }

        return result;
    }

    public String convertArrayToString(String[] s) {
        String result = "";

        for (int i = 0; i < s.length; i++) {
            if (i == s.length - 1) {
                result+= s[i];
            }
            else {
                result+= s[i] + ",";
            }
        }
        return result;
    }

    public String convertJSONArrayToString(JSONArray s) throws JSONException {
        String result = "";

        for (int i = 0; i < s.length(); i++) {
            if (i == s.length() - 1) {
                result+= s.get(i);
            }
            else {
                result+= s.get(i) + ",";
            }
        }
        return result;
    }

    public final class UserAccount extends MainActivity {
        private int myStaticMember;
        private String TAG = "User Class";

        public UserAccount() {
            myStaticMember = 1;
        }

        public void signIn(String email) {
            // Instantiate the RequestQueue.
            RequestQueue queue = Volley.newRequestQueue(LoginActivity.this);
            String url = "http://20.53.224.7:8082/checkUserExists?email=" + email;
            // 10.0.2.2 is a special alias to localhost for developers

            // Request a string response from the provided URL.
            JsonObjectRequest jsonObjectRequest = new JsonObjectRequest
                    (Request.Method.GET, url, null, new Response.Listener<JSONObject>() {
                        @Override
                        public void onResponse(JSONObject response) {
                            //TODO: locally store user account information

                            try {
                                String restrictions = convertJSONArrayToString((JSONArray) response.get("dietaryRestrictions"));
                                Log.d(TAG, restrictions);
                                SharedPreferences.Editor myEdit = sharedpreferences.edit();
                                myEdit.putString("dietaryRestrictions", restrictions);
                                myEdit.putInt("userID", (int) response.get("id"));
                                myEdit.apply();
                            } catch (JSONException e) {
                                e.printStackTrace();
                            }

                            Log.d(TAG, response.toString());
                        }
                    }, new Response.ErrorListener() {
                        @Override
                        public void onErrorResponse(VolleyError error) {
                            Log.d(TAG, error.toString());
                        }
                    });

            // Add the request to the RequestQueue.
            queue.add(jsonObjectRequest);

        }

        //TODO: set up this endpoint
//        public void notifyUser(String message) {
//
//        }

        public void updateRestrictions (int userID, String[] dietaryRestrictions) {
            // Instantiate the RequestQueue.
            RequestQueue queue = Volley.newRequestQueue(LoginActivity.this);
            String url = "http://20.53.224.7:8082/updateRestrictions";
            // 10.0.2.2 is a special alias to localhost for developers

            Map<String, String> jsonParams = new HashMap();
            jsonParams.put("userID", String.valueOf(userID));
            jsonParams.put("dietaryRestrictions", encodeString(convertArrayToString(dietaryRestrictions)));


            // Request a string response from the provided URL.
            JsonObjectRequest jsonRequest = new JsonObjectRequest
                    (Request.Method.PUT, url, new JSONObject(jsonParams),new Response.Listener<JSONObject>() {
                        @Override
                        public void onResponse(JSONObject response) {
                            Log.d(TAG, response.toString());
                        }
                    }, new Response.ErrorListener() {
                        @Override
                        public void onErrorResponse(VolleyError error) {
                            Log.d(TAG, error.toString());
                        }
                    }) {
            };

            // Add the request to the RequestQueue.
            queue.add(jsonRequest);
        }

    }

}