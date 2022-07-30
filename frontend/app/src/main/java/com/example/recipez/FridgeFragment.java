package com.example.recipez;

import static java.lang.Long.parseLong;

import android.app.Dialog;
import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.test.espresso.IdlingResource;

import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

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

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.TimeZone;

/**
 * A simple {@link Fragment} subclass.
 * Use the {@link FridgeFragment#newInstance} factory method to
 * create an instance of this fragment.
 */
public class FridgeFragment extends Fragment {
    final static String TAG = "FridgeFragment";

    private ArrayList<JSONObject> ingredients;
    private FridgeAdapter mAdapter;

    SharedPreferences sharedpreferences;
    private int userID; // todo: test if works

    public final class IngredientFetching extends MainActivity {
        private int myStaticMember;
        private String TAG = "Ingredient Class";

        public IngredientFetching() {
            myStaticMember = 1;
        }

        private void requestIngredients(String userID) {
            RequestQueue queue = Volley.newRequestQueue(getActivity().getApplicationContext());
            String url = "http://20.53.224.7:8086/requestIngredients?userid=" + userID + "&googlesignintoken=" + sharedpreferences.getString("googleSignInToken", "");

            JsonArrayRequest jsonRequest = new JsonArrayRequest(Request.Method.GET, url, null, new Response.Listener<JSONArray>() {
                @Override
                public void onResponse(JSONArray response) {
                    try {
                        ingredients = new ArrayList<>();
                        for (int i = 0; i < response.length(); i++) {
                            JSONObject ingredientObject = response.getJSONObject(i);
                            ingredients.add(ingredientObject);
                        }
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }

                    buildFridgeRecyclerView();
                }
            }, new Response.ErrorListener() {
                @Override
                public void onErrorResponse(VolleyError error) {
                    Log.d(TAG, error.toString() + "REQUEST");
                }
            });
            queue.add(jsonRequest);
        }

        private void deleteIngredient(String userID, String ingredient) { // or the actual ingredient, just need the name here
            RequestQueue queue = Volley.newRequestQueue(getActivity().getApplicationContext());
            String url = "http://20.53.224.7:8086/deleteIngredient";

            Map<String, String> jsonParams = new HashMap();
            jsonParams.put("userid", userID);
            jsonParams.put("ingredient", ingredient);
            jsonParams.put("googleSignInToken", sharedpreferences.getString("googleSignInToken", ""));

            JsonObjectRequest jsonRequest = new JsonObjectRequest
                    (Request.Method.POST, url, new JSONObject(jsonParams), new Response.Listener<JSONObject>() {
                        @Override
                        public void onResponse(JSONObject response) {
                            Log.d(TAG, response.toString());
                        }
                    }, new Response.ErrorListener() {
                        @Override
                        public void onErrorResponse(VolleyError error) {
                            Log.d(TAG, error.toString() + "DELETE");
                        }
                    });
            queue.add(jsonRequest);
        }

        private void storeIngredient(String userID, JSONObject ingredient) { // or the actual ingredient, just need the name here
            RequestQueue queue = Volley.newRequestQueue(getActivity().getApplicationContext());
            String url = "http://20.53.224.7:8086/addIngredient";

            Map<String, String> jsonParams = new HashMap();
            try {
                jsonParams.put("userid", userID);
                jsonParams.put("ingredient", ingredient.getString("name"));
                jsonParams.put("expiry", ingredient.getString("expiry"));
                jsonParams.put("googleSignInToken", sharedpreferences.getString("googleSignInToken", ""));
            } catch (Exception e) {
                e.printStackTrace();
            }

            JsonObjectRequest jsonRequest = new JsonObjectRequest
                    (Request.Method.POST, url, new JSONObject(jsonParams), new Response.Listener<JSONObject>() {
                        @Override
                        public void onResponse(JSONObject response) {
                            insertItem(response);
                            EspressoIdlingResource.decrement();
                        }
                    }, new Response.ErrorListener() {
                        @Override
                        public void onErrorResponse(VolleyError error) {
                            Log.d(TAG, error.toString() + "STORE");
                        }
                    });
            EspressoIdlingResource.increment();
            queue.add(jsonRequest);
        }

        private void updateExpiryDate(String userID, JSONObject ingredient) {
            RequestQueue queue = Volley.newRequestQueue(getActivity().getApplicationContext());
            String url = "http://20.53.224.7:8086/updateExpiryDate";

            Map<String, String> jsonParams = new HashMap();
            try {
                jsonParams.put("userid", userID);
                jsonParams.put("ingredient", ingredient.getString("name"));
                jsonParams.put("expiry", ingredient.getString("expiry"));
                jsonParams.put("googleSignInToken", sharedpreferences.getString("googleSignInToken", ""));
            } catch (Exception e) {
                e.printStackTrace();
            }

            JsonObjectRequest jsonRequest = new JsonObjectRequest
                    (Request.Method.POST, url, new JSONObject(jsonParams), new Response.Listener<JSONObject>() {
                        @Override
                        public void onResponse(JSONObject response) {
                            Log.d(TAG, response.toString());
                        }
                    }, new Response.ErrorListener() {
                        @Override
                        public void onErrorResponse(VolleyError error) {
                            Log.d(TAG, error.toString() + "::updateExpiryDate");
                        }
                    }) {
            };

            // Add the request to the RequestQueue.
            queue.add(jsonRequest);
        }

        private void getIngredientSuggestions(String string) {
            RequestQueue queue = Volley.newRequestQueue(getActivity().getApplicationContext());
            String url = "http://20.53.224.7:8086/getIngredientSuggestions?string=" + string + "&googlesignintoken=" + sharedpreferences.getString("googleSignInToken", "");
            JsonArrayRequest jsonArrayRequest = new JsonArrayRequest
                    (Request.Method.GET, url, null, new Response.Listener<JSONArray>() {
                        @Override
                        public void onResponse(JSONArray response) {
                            try {
                                ArrayList<String> ingredientSuggestions = new ArrayList<>();
                                for (int i = 0; i < response.length(); i++) {
                                    String ingredient = response.getJSONObject(i).getString("name");
                                    if (!ingredientInList(ingredient)) {
                                        ingredientSuggestions.add(ingredient);
                                    }
                                }
                                if (ingredientSuggestions.size() == 0) {
                                    Toast.makeText(getActivity().getApplicationContext(), "No ingredients found, please try a different search", Toast.LENGTH_LONG).show();
                                    openAddIngredientDialog();
                                } else {
                                    openSelectIngredientDialog(ingredientSuggestions);
                                }
                            } catch (JSONException e) {
                                e.printStackTrace();
                            }
                            EspressoIdlingResource.decrement();
                        }
                    }, new Response.ErrorListener() {
                        @Override
                        public void onErrorResponse(VolleyError error) {
                            Log.d(TAG, error.toString());
                        }
                    });
            EspressoIdlingResource.increment();
            queue.add(jsonArrayRequest);
        }

        private void checkIngredient(String name) {
            RequestQueue queue = Volley.newRequestQueue(getActivity().getApplicationContext());
            String url = "http://20.53.224.7:8086/requestExpiryDate?ingredient=" + name + "&googlesignintoken=" + sharedpreferences.getString("googleSignInToken", "");

            StringRequest stringRequest = new StringRequest
                    (Request.Method.GET, url, new Response.Listener<String>() {
                        @Override
                        public void onResponse(String response) {
                            if ("-1".equals(response)) {
                                openIngredientExpiryDialog(name);
                            } else {
                                JSONObject newIngredient = new JSONObject();
                                try {
                                    newIngredient.put("name", name);
                                    newIngredient.put("expiry", response);
                                } catch (Exception e) {
                                    e.printStackTrace();
                                }
                                storeIngredient(String.valueOf(userID), newIngredient);
                            }
                        }
                    }, new Response.ErrorListener() {
                        @Override
                        public void onErrorResponse(VolleyError error) {
                            Log.d(TAG, error.toString() + "::updateExpiryDate");
                        }
                    }) {
            };

            queue.add(stringRequest);
        }
    }

    public static FridgeFragment newInstance(String param1, String param2) {
        FridgeFragment fragment = new FridgeFragment();
        Bundle args = new Bundle();
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    private void addIngredient(String name) {
        IngredientFetching ingredient = new IngredientFetching();
        ingredient.checkIngredient(name);
    }

    private void buildFridgeRecyclerView() {
        RecyclerView mRecyclerView = getView().findViewById(R.id.fridgeRecyclerView);
        mRecyclerView.setHasFixedSize(true);
        RecyclerView.LayoutManager mLayoutManager = new LinearLayoutManager(getActivity());
        mAdapter = new FridgeAdapter(ingredients);

        mRecyclerView.setLayoutManager(mLayoutManager);
        mRecyclerView.setAdapter(mAdapter);

        mAdapter.setOnItemClickListener(new FridgeAdapter.OnItemClickListener() {
            @Override
            public void onItemClick(int position) {
                openEditIngredientDialog(position);
            }

            @Override
            public void onDeleteClick(int position) {
                removeItem(position);
            }
        });
    }

    private void insertItem(JSONObject insert) {
        ingredients.add(ingredients.size(), insert);
        mAdapter.notifyDataSetChanged();
    }

    private void removeItem(int position) {
        IngredientFetching ingredient = new IngredientFetching();
        try {
            ingredient.deleteIngredient(String.valueOf(userID), ingredients.get(position).getString("name"));
        } catch (Exception e) {
            e.printStackTrace();
        }
        ingredients.remove(position);
        mAdapter.notifyItemRemoved(position);
    }

    private void editItem(int position, JSONObject editedItem) {
        IngredientFetching ingredient = new IngredientFetching();
        ingredient.updateExpiryDate(String.valueOf(userID), editedItem);
        ingredients.set(position, editedItem);
        mAdapter.notifyItemChanged(position);
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_fridge, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        sharedpreferences = getActivity().getSharedPreferences("UserData", Context.MODE_PRIVATE);
        userID = sharedpreferences.getInt("userID", 0);

        ImageButton addIngredientButton = view.findViewById(R.id.addIngredientButton);
        addIngredientButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                openAddIngredientDialog();
            }
        });

        IngredientFetching ingredient = new IngredientFetching();
        ingredient.requestIngredients(String.valueOf(userID));
    }

    private void openSelectIngredientDialog(ArrayList<String> selectIngredients) {
        Dialog dialog = new Dialog(getActivity());
        dialog.setContentView(R.layout.dialog_select_ingredient);

        ListView selectIngredientList = dialog.findViewById(R.id.selectIngredientList);
        ArrayAdapter<String> adapter = new ArrayAdapter<String>(getActivity().getApplicationContext(), R.layout.list_row_select_ingredient, selectIngredients);
        selectIngredientList.setAdapter(adapter);

        selectIngredientList.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                addIngredient(selectIngredients.get(position));
                dialog.dismiss();
            }
        });

        dialog.show();
    }

    private boolean ingredientInList(String ingredient) {
        try {
            for (JSONObject ing : ingredients) {
                if (ing.getString("name").equalsIgnoreCase(ingredient)) {
                    return true;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    private void openIngredientExpiryDialog(String ingredient) {
        Dialog dialog = new Dialog(getActivity());
        dialog.setContentView(R.layout.dialog_edit_ingredient);

        EditText expiry = dialog.findViewById(R.id.newIngredientExpiry);

        TextView currentIngredientName = dialog.findViewById(R.id.currentIngredientName);
        try {
            currentIngredientName.setText("Set expiry date for " + ingredient);
        } catch (Exception e) {
            e.printStackTrace();
        }

        Button submitButton = dialog.findViewById(R.id.editIngredientSubmit);
        submitButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String newExpiryDateString = expiry.getText().toString();
                if ("".equals(newExpiryDateString) || newExpiryDateString.length() != 8) {
                    Toast.makeText(getActivity(), "Please enter a valid date!", Toast.LENGTH_LONG).show();
                }
                else {
                    try {
                        JSONObject addIngredient = new JSONObject();
                        addIngredient.put("name", ingredient);
                        SimpleDateFormat format = new SimpleDateFormat("MMddyyyy");
                        format.setTimeZone(TimeZone.getTimeZone("GMT-8"));
                        String newExpiryDateUnixString = String.valueOf(format.parse(newExpiryDateString).getTime() / 1000L);

                        if (parseLong(newExpiryDateUnixString) > Integer.MAX_VALUE || parseLong(newExpiryDateUnixString) < Integer.MIN_VALUE) {
                            Toast.makeText(getActivity(), "Please enter a valid date!", Toast.LENGTH_LONG).show();
                        } else {
                            addIngredient.put("expiry", newExpiryDateUnixString);
                            IngredientFetching i = new IngredientFetching();
                            i.storeIngredient(String.valueOf(userID), addIngredient);

                            dialog.dismiss();
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }
        });

        dialog.show();
    }

    private void openAddIngredientDialog() {
        Dialog dialog = new Dialog(getActivity());
        dialog.setContentView(R.layout.dialog_add_ingredient);

        EditText editIngredientName = dialog.findViewById(R.id.editIngredientName);

        Button addIngredientConfirm = dialog.findViewById(R.id.addIngredientConfirm);
        addIngredientConfirm.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String name = editIngredientName.getText().toString();
                IngredientFetching ingredient = new IngredientFetching();
                ingredient.getIngredientSuggestions(name);
                dialog.dismiss();
            }
        });

        dialog.show();
    }

    private void openEditIngredientDialog(int position) {
        Dialog dialog = new Dialog(getActivity());
        dialog.setContentView(R.layout.dialog_edit_ingredient);

        TextView currentIngredientName = dialog.findViewById(R.id.currentIngredientName);
        try {
            currentIngredientName.setText("Update expiry date for " + ingredients.get(position).getString("name"));
        } catch (Exception e) {
            e.printStackTrace();
        }

        EditText newIngredientExpiry = dialog.findViewById(R.id.newIngredientExpiry);

        Button editIngredientSubmit = dialog.findViewById(R.id.editIngredientSubmit);
        editIngredientSubmit.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String newExpiryDateString = newIngredientExpiry.getText().toString();
                if ("".equals(newExpiryDateString) || newExpiryDateString.length() != 8) {
                    Toast.makeText(getActivity(), "Please enter a valid date!", Toast.LENGTH_LONG).show();
                }
                else {
                    try {
                        SimpleDateFormat format = new SimpleDateFormat("MMddyyyy");
                        format.setTimeZone(TimeZone.getTimeZone("GMT-8"));
                        String newExpiryDateUnixString = String.valueOf(format.parse(newExpiryDateString).getTime() / 1000L);

                        if (parseLong(newExpiryDateUnixString) > Integer.MAX_VALUE || parseLong(newExpiryDateUnixString) < Integer.MIN_VALUE) {
                            Toast.makeText(getActivity(), "Please enter a valid date!", Toast.LENGTH_LONG).show();
                        } else {
                            JSONObject newIngredientObject = ingredients.get(position);
                            newIngredientObject.put("expiry", newExpiryDateUnixString);
                            Log.d(TAG, newExpiryDateUnixString);
                            editItem(position, newIngredientObject);

                            dialog.dismiss();
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }
        });

        dialog.show();
    }
}