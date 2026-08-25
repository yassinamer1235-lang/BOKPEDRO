import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";


import {
    getAuth,
    createUserWithEmailAndPassword,
    updateEmail,
    deleteUser
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


import {
    getDatabase,
    ref,
    get,
    set,
    remove
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";


// =====================================================
// Firebase الجديد
// =====================================================

const firebaseConfig = {

    apiKey:
        "AIzaSyB8gutsoIyXFs3XG1liVvQRf_XmpJ-VuOg",

    authDomain:
        "bok-pedro.firebaseapp.com",

    databaseURL:
        "https://bok-pedro-default-rtdb.firebaseio.com",

    projectId:
        "bok-pedro",

    storageBucket:
        "bok-pedro.firebasestorage.app",

    messagingSenderId:
        "667121386221",

    appId:
        "1:667121386221:web:a8d536afe841cfff1dc2e4",

    measurementId:
        "G-GPEXZ9ECMZ"
};


// =====================================================
// تشغيل Firebase
// =====================================================

const app =
    initializeApp(firebaseConfig);


const auth =
    getAuth(app);


const db =
    getDatabase(app);


// =====================================================
// عناصر الصفحة
// =====================================================

const usernameInput =
    document.getElementById("username");


const passwordInput =
    document.getElementById("password");


const subscriptionInput =
    document.getElementById("subscription");


const subscriptionInfo =
    document.getElementById("subscriptionInfo");


const createButton =
    document.getElementById("createAccount");


const message =
    document.getElementById("message");


// =====================================================
// التأكد من العناصر
// =====================================================

if (
    !usernameInput ||
    !passwordInput ||
    !subscriptionInput ||
    !subscriptionInfo ||
    !createButton ||
    !message
) {

    console.error(
        "خطأ: بعض عناصر HTML غير موجودة."
    );
}


// =====================================================
// عرض الرسائل
// =====================================================

function showMessage(
    text,
    type = ""
) {

    message.className = type;

    message.innerHTML = text;
}


// =====================================================
// أسماء الاشتراكات
// =====================================================

const subscriptionNames = {

    day:
        "يوم واحد",

    week:
        "أسبوع واحد",

    month:
        "شهر واحد",

    "3months":
        "3 شهور",

    "12months":
        "12 شهر"
};


// =====================================================
// تحديث معلومات الاشتراك
// =====================================================

function updateSubscriptionInfo() {

    const type =
        subscriptionInput.value;


    const name =
        subscriptionNames[type] ||
        "يوم واحد";


    subscriptionInfo.innerHTML =
        `مدة الاشتراك: <strong>${name}</strong>`;
}


subscriptionInput.addEventListener(
    "change",
    updateSubscriptionInfo
);


updateSubscriptionInfo();


// =====================================================
// حساب نهاية الاشتراك
// =====================================================

function calculateSubscriptionEnd(
    startDate,
    subscriptionType
) {

    const endDate =
        new Date(
            startDate.getTime()
        );


    switch (subscriptionType) {

        case "day":

            endDate.setDate(
                endDate.getDate() + 1
            );

            break;


        case "week":

            endDate.setDate(
                endDate.getDate() + 7
            );

            break;


        case "month":

            endDate.setMonth(
                endDate.getMonth() + 1
            );

            break;


        case "3months":

            endDate.setMonth(
                endDate.getMonth() + 3
            );

            break;


        case "12months":

            endDate.setFullYear(
                endDate.getFullYear() + 1
            );

            break;


        default:

            throw new Error(
                "مدة الاشتراك غير صحيحة."
            );
    }


    return endDate;
}


// =====================================================
// تنسيق التاريخ
// =====================================================

function formatDate(date) {

    return new Intl.DateTimeFormat(
        "ar-EG",
        {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    ).format(date);
}


// =====================================================
// توليد رقم حساب 7 أرقام
// =====================================================

function generateAccountNumber() {

    return Math.floor(
        1000000 +
        Math.random() * 9000000
    ).toString();
}


// =====================================================
// البحث عن رقم حساب متاح
//
// ملاحظة:
// هذه الدالة تعمل بعد تسجيل المستخدم في Auth
// لأن Rules تتطلب auth != null
// =====================================================

async function getAvailableAccountNumber() {

    const maxAttempts = 30;


    for (
        let attempt = 0;
        attempt < maxAttempts;
        attempt++
    ) {

        const accountNumber =
            generateAccountNumber();


        const accountRef =
            ref(
                db,
                "accountNumbers/" +
                accountNumber
            );


        const snapshot =
            await get(accountRef);


        if (!snapshot.exists()) {

            return accountNumber;
        }
    }


    throw new Error(
        "لم يتم العثور على رقم حساب متاح."
    );
}


// =====================================================
// إنشاء الحساب
// =====================================================

createButton.addEventListener(
    "click",
    async () => {

        const username =
            usernameInput.value.trim();


        const password =
            passwordInput.value;


        const subscriptionType =
            subscriptionInput.value;


        // =============================================
        // التحقق من اسم المستخدم
        // =============================================

        if (username.length < 3) {

            showMessage(
                "اسم المستخدم يجب أن يكون 3 أحرف على الأقل.",
                "error"
            );

            return;
        }


        // =============================================
        // التحقق من كلمة المرور
        // =============================================

        if (password.length < 6) {

            showMessage(
                "كلمة المرور يجب أن تكون 6 أحرف على الأقل.",
                "error"
            );

            return;
        }


        // =============================================
        // التحقق من الاشتراك
        // =============================================

        if (
            !subscriptionNames[
                subscriptionType
            ]
        ) {

            showMessage(
                "يرجى اختيار مدة اشتراك صحيحة.",
                "error"
            );

            return;
        }


        // =============================================
        // تعطيل الزر
        // =============================================

        createButton.disabled = true;

        createButton.textContent =
            "جاري إنشاء الحساب...";


        showMessage(
            "جاري إنشاء الحساب...",
            "loading"
        );


        let createdUser = null;

        let accountNumber = null;

        let userDataSaved = false;

        let accountNumberSaved = false;


        try {

            // =========================================
            // وقت الاشتراك
            // =========================================

            const subscriptionStart =
                new Date();


            const subscriptionEnd =
                calculateSubscriptionEnd(
                    subscriptionStart,
                    subscriptionType
                );


            // =========================================
            // إنشاء بريد مؤقت
            //
            // نحتاج Auth أولاً حتى تسمح Rules
            // بقراءة accountNumbers
            // =========================================

            const temporaryId =
                Date.now() +
                "_" +
                Math.random()
                    .toString(36)
                    .substring(2, 10);


            const temporaryEmail =
                "temp_" +
                temporaryId +
                "@bok-pedro.firebaseapp.com";


            // =========================================
            // إنشاء مستخدم Firebase Authentication
            // =========================================

            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    temporaryEmail,
                    password
                );


            createdUser =
                userCredential.user;


            const uid =
                createdUser.uid;


            // =========================================
            // الآن auth موجود
            // وبالتالي Rules تسمح بقراءة
            // accountNumbers
            // =========================================

            accountNumber =
                await getAvailableAccountNumber();


            // =========================================
            // تحويل البريد المؤقت إلى بريد الحساب
            // =========================================

            const accountEmail =
                accountNumber +
                "@bok-pedro.firebaseapp.com";


            await updateEmail(
                createdUser,
                accountEmail
            );


            // =========================================
            // بيانات المستخدم
            // =========================================

            const userData = {

                username:
                    username,

                accountNumber:
                    accountNumber,

                uid:
                    uid,

                createdAt:
                    Date.now(),

                subscriptionType:
                    subscriptionType,

                subscriptionName:
                    subscriptionNames[
                        subscriptionType
                    ],

                subscriptionStart:
                    subscriptionStart.getTime(),

                subscriptionEnd:
                    subscriptionEnd.getTime(),

                active:
                    true
            };


            // =========================================
            // حفظ المستخدم
            // =========================================

            await set(
                ref(
                    db,
                    "users/" +
                    uid
                ),
                userData
            );


            userDataSaved = true;


            // =========================================
            // حفظ رقم الحساب
            // =========================================

            await set(
                ref(
                    db,
                    "accountNumbers/" +
                    accountNumber
                ),
                {

                    uid:
                        uid
                }
            );


            accountNumberSaved = true;


            // =========================================
            // نجاح
            // =========================================

            showMessage(

                `
                <div class="success-title">
                    تم إنشاء الحساب بنجاح 🎉
                </div>

                <div class="account-box">

                    <div class="account-label">
                        اسم المستخدم
                    </div>

                    <strong>
                        ${escapeHTML(username)}
                    </strong>


                    <div class="account-label">
                        رقم الحساب
                    </div>

                    <div class="account-number">
                        ${accountNumber}
                    </div>


                    <div class="account-label">
                        مدة الاشتراك
                    </div>

                    <strong>
                        ${subscriptionNames[
                            subscriptionType
                        ]}
                    </strong>


                    <div class="account-label">
                        ينتهي الاشتراك في
                    </div>

                    <div class="subscription-end">
                        ${formatDate(
                            subscriptionEnd
                        )}
                    </div>

                </div>


                <p class="success-text">
                    احتفظ برقم الحساب وكلمة المرور.
                </p>
                `,

                "success"
            );


            // =========================================
            // تنظيف الحقول
            // =========================================

            usernameInput.value = "";

            passwordInput.value = "";

            subscriptionInput.value =
                "day";

            updateSubscriptionInfo();


        } catch (error) {

            console.error(
                "Firebase Error:",
                error
            );


            // =========================================
            // تنظيف البيانات إذا فشل شيء
            // =========================================

            try {

                if (
                    accountNumberSaved &&
                    accountNumber
                ) {

                    await remove(
                        ref(
                            db,
                            "accountNumbers/" +
                            accountNumber
                        )
                    );
                }


                if (
                    userDataSaved &&
                    createdUser
                ) {

                    await remove(
                        ref(
                            db,
                            "users/" +
                            createdUser.uid
                        )
                    );
                }


                if (createdUser) {

                    await deleteUser(
                        createdUser
                    );
                }

            } catch (cleanupError) {

                console.error(
                    "Cleanup Error:",
                    cleanupError
                );
            }


            // =========================================
            // رسالة الخطأ
            // =========================================

            let errorMessage =
                "حدث خطأ أثناء إنشاء الحساب.";


            switch (error.code) {

                case "auth/operation-not-allowed":

                    errorMessage =
                        "تسجيل الدخول بالبريد الإلكتروني غير مفعّل في Firebase Authentication.";

                    break;


                case "auth/email-already-in-use":

                    errorMessage =
                        "هذا الحساب موجود بالفعل. حاول مرة أخرى.";

                    break;


                case "auth/weak-password":

                    errorMessage =
                        "كلمة المرور ضعيفة. استخدم 6 أحرف أو أكثر.";

                    break;


                case "auth/invalid-email":

                    errorMessage =
                        "حدث خطأ في البريد الإلكتروني.";

                    break;


                case "auth/network-request-failed":

                    errorMessage =
                        "تأكد من اتصال الإنترنت.";

                    break;


                case "auth/invalid-api-key":

                    errorMessage =
                        "مفتاح Firebase API غير صحيح.";

                    break;


                case "auth/requires-recent-login":

                    errorMessage =
                        "يرجى إعادة المحاولة.";

                    break;


                case "PERMISSION_DENIED":

                    errorMessage =
                        "قواعد Firebase تمنع الوصول إلى البيانات.";

                    break;


                default:

                    if (
                        error.message &&
                        error.message.includes(
                            "PERMISSION_DENIED"
                        )
                    ) {

                        errorMessage =
                            "قواعد Firebase تمنع الوصول إلى البيانات.";

                    } else if (
                        error.message
                    ) {

                        errorMessage =
                            error.message;
                    }

                    break;
            }


            showMessage(
                escapeHTML(errorMessage),
                "error"
            );
        }


        // =============================================
        // إعادة الزر
        // =============================================

        createButton.disabled = false;

        createButton.textContent =
            "فتح الحساب";

    }
);


// =====================================================
// حماية HTML
// =====================================================

function escapeHTML(text) {

    return String(text)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
        }
