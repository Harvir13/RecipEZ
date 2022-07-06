package com.example.myapplication;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;

import com.android.volley.AuthFailureError;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonArrayRequest;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Map;

public class MainActivity extends AppCompatActivity {

    private String TAG = "MainActivity";
    private SharedPreferences sharedpreferences;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        sharedpreferences = MainActivity.this.getSharedPreferences("UserData", Context.MODE_PRIVATE);

//        Recipe recipe = new Recipe();
        UserAccount userAccount = new UserAccount();
//        recipe.getFullRecipeDetails(713204);
//        recipe.addRecipeToBookmarkList("1", "123", "/home/test", "Test Call from Volley", "Image Link");
//        recipe.removeRecipeFromBookmarkList("1", "123");
//        recipe.getRecipesFromBookmarkList(1);
//        String[] ingredients = {"apples", "sugar"};
//        String[] filters = {"vegetarian"};
//        String[] restrictions = {"lemon zest"};
//        recipe.filterRecipes(ingredients, filters, restrictions);
//        recipe.getSuggestedRecipes(ingredients, restrictions);
//        recipe.searchRecipe("pasta");
//        String[] restrictions = {"orange"};
//        userAccount.updateRestrictions(4, restrictions);
        userAccount.signIn("test4@test.com");

        Log.d(TAG, "stored restrictions:" + sharedpreferences.getString("dietaryRestrictions", ""));
        Log.d(TAG, "stored id:" + sharedpreferences.getInt("userID", 0));
        // User .split(",",0) to get the array of strings
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

    public final class Recipe extends MainActivity {

        private int myStaticMember;
        private String TAG = "Recipe Class";

        public Recipe () {
            myStaticMember = 1;
        }

    public void addRecipeToBookmarkList(int userID, int recipeID, String path, String title, String image) {
        // Instantiate the RequestQueue.
        RequestQueue queue = Volley.newRequestQueue(MainActivity.this);
        String url = "http://10.0.2.2:8084/addRecipe";
        // 10.0.2.2 is a special alias to localhost for developers

        Map<String, String> jsonParams = new HashMap();
        jsonParams.put("userID", String.valueOf(userID));
        jsonParams.put("recipeID", String.valueOf(recipeID));
        jsonParams.put("path", path);
        jsonParams.put("title", title);
        jsonParams.put("image", image);

        // Request a string response from the provided URL.
        JsonObjectRequest jsonRequest = new JsonObjectRequest
                (Request.Method.POST, url, new JSONObject(jsonParams),new Response.Listener<JSONObject>() {
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

    public void removeRecipeFromBookmarkList(int userID, int recipeID) {
        // Instantiate the RequestQueue.
        RequestQueue queue = Volley.newRequestQueue(MainActivity.this);
        String url = "http://10.0.2.2:8084/removeRecipe";
        // 10.0.2.2 is a special alias to localhost for developers

        Map<String, String> jsonParams = new HashMap();
        jsonParams.put("userID", String.valueOf(userID));
        jsonParams.put("recipeID", String.valueOf(recipeID));

        // Request a string response from the provided URL.
        JsonObjectRequest jsonRequest = new JsonObjectRequest
                (Request.Method.DELETE, url, new JSONObject(jsonParams),new Response.Listener<JSONObject>() {
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

        public void getRecipesFromBookmarkList(int userID) {
            // Instantiate the RequestQueue.
            RequestQueue queue = Volley.newRequestQueue(MainActivity.this);
            String url = "http://10.0.2.2:8084/getRecipes?userid=" + userID;
            // 10.0.2.2 is a special alias to localhost for developers

            // Request a string response from the provided URL.
            JsonObjectRequest jsonRequest = new JsonObjectRequest
                    (Request.Method.GET, url, null, new Response.Listener<JSONObject>() {
                        @Override
                        public void onResponse(JSONObject response) {
                            Log.d(TAG, response.toString());
                        }
                    }, new Response.ErrorListener() {
                        @Override
                        public void onErrorResponse(VolleyError error) {
                            Log.d(TAG, error.toString());
                        }
                    });

            // Add the request to the RequestQueue.
            queue.add(jsonRequest);

        }

        public void filterRecipes(String[] ingredients, String[] filters, String[] restrictions) {
            // Instantiate the RequestQueue.
            RequestQueue queue = Volley.newRequestQueue(MainActivity.this);
            String ingredientsList = encodeString(convertArrayToString(ingredients));
            String filtersList = encodeString(convertArrayToString(filters));
            String restrictionsList = encodeString(convertArrayToString(restrictions));

            String url = "http://10.0.2.2:8084/requestFilteredRecipes?ingredients=" + ingredientsList + "&restrictions=" + restrictionsList + "&filters=" + filtersList;
            // 10.0.2.2 is a special alias to localhost for developers

            // Request a string response from the provided URL.
            JsonArrayRequest jsonRequest = new JsonArrayRequest
                    (Request.Method.GET, url, null, new Response.Listener<JSONArray>() {
                        @Override
                        public void onResponse(JSONArray response) {
                            Log.d(TAG, response.toString());
                        }
                    }, new Response.ErrorListener() {
                        @Override
                        public void onErrorResponse(VolleyError error) {
                            Log.d(TAG, error.toString());
                        }
                    });

            // Add the request to the RequestQueue.
            queue.add(jsonRequest);
        }

        public void getSuggestedRecipes(String[] ingredients, String[] restrictions) {
            // Instantiate the RequestQueue.
            RequestQueue queue = Volley.newRequestQueue(MainActivity.this);
            String ingredientsList = encodeString(convertArrayToString(ingredients));
            String restrictionsList = encodeString(convertArrayToString(restrictions));

            String url = "http://10.0.2.2:8084/generateSuggestedRecipesList?ingredientsinpantry=" + ingredientsList + "&restrictions=" + restrictionsList;
            // 10.0.2.2 is a special alias to localhost for developers

            // Request a string response from the provided URL.
            JsonArrayRequest jsonRequest = new JsonArrayRequest
                    (Request.Method.GET, url, null, new Response.Listener<JSONArray>() {
                        @Override
                        public void onResponse(JSONArray response) {
                            Log.d(TAG, response.toString());
                        }
                    }, new Response.ErrorListener() {
                        @Override
                        public void onErrorResponse(VolleyError error) {
                            Log.d(TAG, error.toString());
                        }
                    });

            // Add the request to the RequestQueue.
            queue.add(jsonRequest);

        }

        public void searchRecipe(String recipeName) {// Instantiate the RequestQueue.
            RequestQueue queue = Volley.newRequestQueue(MainActivity.this);
            String url = "http://10.0.2.2:8084/searchRecipe?recipename=" + recipeName;
            // 10.0.2.2 is a special alias to localhost for developers

            // Request a string response from the provided URL.
            JsonArrayRequest jsonRequest = new JsonArrayRequest
                    (Request.Method.GET, url, null, new Response.Listener<JSONArray>() {
                        @Override
                        public void onResponse(JSONArray response) {
                            Log.d(TAG, response.toString());
                        }
                    }, new Response.ErrorListener() {
                        @Override
                        public void onErrorResponse(VolleyError error) {
                            Log.d(TAG, error.toString());
                        }
                    });

            // Add the request to the RequestQueue.
            queue.add(jsonRequest);

        }

        public void getFullRecipeDetails(int recipeID) {
            // Instantiate the RequestQueue.
            RequestQueue queue = Volley.newRequestQueue(MainActivity.this);
            String url = "http://10.0.2.2:8084/getRecipeDetails?recipeid=" + recipeID;
            // 10.0.2.2 is a special alias to localhost for developers

            // Request a string response from the provided URL.
            JsonObjectRequest jsonObjectRequest = new JsonObjectRequest
                    (Request.Method.GET, url, null, new Response.Listener<JSONObject>() {
                        @Override
                        public void onResponse(JSONObject response) {
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

    }

    public final class UserAccount extends MainActivity {

        private int myStaticMember;
        private String TAG = "User Class";

        public UserAccount() {
            myStaticMember = 1;
        }

        public void signIn(String email) {
            // Instantiate the RequestQueue.
            RequestQueue queue = Volley.newRequestQueue(MainActivity.this);
            String url = "http://10.0.2.2:8082/checkUserExists?email=" + email;
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
            RequestQueue queue = Volley.newRequestQueue(MainActivity.this);
            String url = "http://10.0.2.2:8082/updateRestrictions";
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