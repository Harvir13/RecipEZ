package com.example.recipez;

import android.content.Intent;
import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.cardview.widget.CardView;
import androidx.fragment.app.Fragment;

import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.ImageView;
import android.widget.ListView;
import android.widget.TextView;

import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.squareup.picasso.Picasso;

import java.util.ArrayList;

/**
 * A simple {@link Fragment} subclass.
 * Use the {@link ProfileFragment#newInstance} factory method to
 * create an instance of this fragment.
 */
public class ProfileFragment extends Fragment {
    final static String TAG = "ProfileFragment";

    // TODO: Rename parameter arguments, choose names that match
    // the fragment initialization parameters, e.g. ARG_ITEM_NUMBER
    private static final String ARG_PARAM1 = "param1";
    private static final String ARG_PARAM2 = "param2";

    // TODO: Rename and change types of parameters
    private String mParam1;
    private String mParam2;

    private String userGooglePrefName;
    private String userGooglePhotoUrl;
    private TextView userGooglePrefNameText;
    private ImageView userGooglePhoto;
    private ListView settingsList;
    private CardView bookmarkListButton;

    public ProfileFragment() {
        // Required empty public constructor
    }

    /**
     * Use this factory method to create a new instance of
     * this fragment using the provided parameters.
     *
     * @param param1 Parameter 1.
     * @param param2 Parameter 2.
     * @return A new instance of fragment ProfileFragment.
     */
    // TODO: Rename and change types and number of parameters
    public static ProfileFragment newInstance(String param1, String param2) {
        ProfileFragment fragment = new ProfileFragment();
//        Bundle args = new Bundle();
//        args.putString(ARG_PARAM1, param1);
//        args.putString(ARG_PARAM2, param2);
//        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (getArguments() != null) {
//            mParam1 = getArguments().getString(ARG_PARAM1);
//            mParam2 = getArguments().getString(ARG_PARAM2);

            userGooglePrefName = getArguments().getString("USER_GOOGLE_PREF_NAME");
            userGooglePhotoUrl = getArguments().getString("USER_GOOGLE_PHOTO_URL");
//            Log.d(TAG, "Pref Name: " + userGooglePrefName);
//            Log.d(TAG, "Photo Url: " + userGooglePhotoUrl);
        }
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_profile, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        GoogleSignInAccount account = GoogleSignIn.getLastSignedInAccount(getActivity());
        userGooglePrefNameText = view.findViewById(R.id.user_pref_name_text);
        userGooglePrefNameText.setText(account.getDisplayName());
        userGooglePhoto = view.findViewById(R.id.user_photo_image);
        Picasso.get().load(account.getPhotoUrl()).transform(new CircleTransform()).into(userGooglePhoto);

        String[] settingsListArray = {"App settings", "Sign out"};
        settingsList = view.findViewById(R.id.settings_list);
        ArrayAdapter<String> arrayAdapter = new ArrayAdapter<>(getActivity(), android.R.layout.simple_list_item_1, settingsListArray);
        settingsList.setAdapter(arrayAdapter);
        settingsList.setClickable(true);
        settingsList.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> adapterView, View view, int i, long l) {
                // this is so scuffed rn, pls look away
                // (prob gonna get rid of the list/adapter all together)
                if (i == 0) {
                    Fragment fragment = new AppSettingsFragment();
                    getParentFragmentManager().beginTransaction().replace(R.id.frame, fragment).commit();
                }
            }
        });

        bookmarkListButton = view.findViewById(R.id.bookmarked_list_card);
        bookmarkListButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Fragment fragment = new BookmarkListFragmentNew();
                getParentFragmentManager().beginTransaction().replace(R.id.frame, fragment).commit();
            }
        });
    }
}