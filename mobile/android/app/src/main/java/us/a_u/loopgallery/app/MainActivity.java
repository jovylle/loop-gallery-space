package us.a_u.loopgallery.app;

import android.os.Bundle;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Keep WebView below status bar / nav bar (fixes overlap with remote URL).
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
    }
}
