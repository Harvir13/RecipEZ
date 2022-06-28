package com.example.recipez;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.MenuItem;
import android.view.View;

import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.material.bottomnavigation.BottomNavigationView;
import com.google.android.material.floatingactionbutton.FloatingActionButton;

public class MainActivity extends AppCompatActivity {
    final static String TAG = "MainActivity";
    private String userGooglePrefName;
    private String userGooglePhotoUrl;

    Fragment fragment = new RecipesFragment();
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        Bundle extras = getIntent().getExtras();
        if (extras != null) {
            userGooglePrefName = extras.getString("USER_GOOGLE_PREF_NAME");
            userGooglePhotoUrl = extras.getString("USER_GOOGLE_PHOTO_URL");
        }

        getSupportFragmentManager().beginTransaction().replace(R.id.frame, fragment).commit();
        BottomNavigationView bottomNavigationView = findViewById(R.id.bottomNavigationView);

        bottomNavigationView.setOnNavigationItemSelectedListener(new BottomNavigationView.OnNavigationItemSelectedListener() {
            @Override
            public boolean onNavigationItemSelected(@NonNull MenuItem item) {
                switch (item.getItemId()) {
                    case R.id.recipes:
                        fragment = new RecipesFragment();
                        break;
                    case R.id.profile:
                        fragment = new ProfileFragment();
                        Bundle userInfoBundle = new Bundle();
                        userInfoBundle.putString("USER_GOOGLE_PREF_NAME", userGooglePrefName);
                        userInfoBundle.putString("USER_GOOGLE_PHOTO_URL", userGooglePhotoUrl);
                        fragment.setArguments(userInfoBundle);
                        break;
                }

                getSupportFragmentManager().beginTransaction().replace(R.id.frame, fragment).commit();
                return true;
            }
        });

        FloatingActionButton fab = findViewById(R.id.fridgeFab);
        fab.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                fragment = new FridgeFragment();
                getSupportFragmentManager().beginTransaction().replace(R.id.frame, fragment).commit();
            }
        });
    }
}