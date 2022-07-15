package com.example.recipez;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.cardview.widget.CardView;
import androidx.fragment.app.Fragment;

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
import com.squareup.picasso.Picasso;

/**
 * A simple {@link Fragment} subclass.
 * Use the {@link ProfileFragment#newInstance} factory method to
 * create an instance of this fragment.
 */
public class ProfileFragment extends Fragment {
    final static String TAG = "ProfileFragment";

    /**
     * Use this factory method to create a new instance of
     * this fragment using the provided parameters.
     *
     * @param param1 Parameter 1.
     * @param param2 Parameter 2.
     * @return A new instance of fragment ProfileFragment.
     */
    public static ProfileFragment newInstance(String param1, String param2) {
        ProfileFragment fragment = new ProfileFragment();
        return fragment;
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
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

        TextView userGooglePrefNameText;
        ImageView userGooglePhoto;
        ListView settingsList;
        CardView bookmarkListButton;
        CardView allergyAndFoodRestrictionButton;

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
                if (i == 0) { // app settings
                    AlertDialog.Builder builder = new AlertDialog.Builder(getActivity());
                    builder.setMessage("To be implemented");
                    builder.setPositiveButton("Dismiss", new DialogInterface.OnClickListener() {
                        public void onClick(DialogInterface dialog, int id) {
                            dialog.dismiss();
                        }
                    });
                    AlertDialog dialog = builder.create();
                    dialog.show();
                }
                if (i == 1) { // google sign out
                    AlertDialog.Builder builder = new AlertDialog.Builder(getActivity());
                    builder.setMessage("To be implemented");
                    builder.setPositiveButton("Dismiss", new DialogInterface.OnClickListener() {
                        public void onClick(DialogInterface dialog, int id) {
                            dialog.dismiss();
                        }
                    });
                    AlertDialog dialog = builder.create();
                    dialog.show();
                }
            }
        });

        allergyAndFoodRestrictionButton = view.findViewById(R.id.allergy_and_food_restrictions_button);
        allergyAndFoodRestrictionButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Fragment fragment = new AllergiesListFragment();
                getParentFragmentManager().beginTransaction().replace(R.id.frame, fragment).commit();
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