import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../AccountSettings.css";

export default function AccountInfo() {
  return (
    <div className="account-root d-flex mx-auto min-vh-100 max-w-md flex-column bg-background">
      {/* Header */}
      <header className="d-flex align-items-center bg-background p-3 sticky-top border-bottom">
        <button className="btn icon-back p-0 me-2" aria-label="Back">
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h1 className="flex-grow-1 text-center m-0 account-title">Account</h1>
      </header>

      {/* Main */}
      <main className="flex-grow-1 px-3 py-4">
        {/* Profile Section */}
        <section className="mb-4 text-center">
          <div className="position-relative mb-3">
            <div
              className="profile-avatar mx-auto"
              role="img"
              aria-label="User's profile picture, abstract placeholder"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBx8nuSiDbhe--aZl6BVXtjGTCmBIHlfLxmcqEz30L_aUk2mRd5r56QX_qjfmojuD7jdzyDuEwK-LwIK_cH63oJwshR-HO-5-w7n7a9hSLEN6xKJzgzgm4DLuBEkoYzo5qeZ6sNIL0lctIjAKqCiEBSUMhieLi2619oVuP28PoKHhyWy3ADJG3x9v0IBpFDE5ngy0e0k8gpkvv3HbKsAAak7UQTgKVnFSCgpenYirX-8s4_p18ZwLDCcuWsnZ0Q6IgrCmjPH2xNxvE")'
              }}
            />
            <button
              className="btn edit-avatar position-absolute d-grid place-items-center"
              aria-label="Edit profile picture"
            >
              <span className="material-symbols-outlined">edit</span>
            </button>
          </div>
          <h2 className="mb-1 profile-name">John Doe</h2>
          <p className="mb-0 profile-email">john.doe@email.com</p>
        </section>

        {/* Account Information */}
        <section className="mb-4">
          <h3 className="section-heading">Account Information</h3>

          <div className="card settings-card">
            <button className="list-row d-flex align-items-center justify-content-between w-100 p-3 text-start">
              <div>
                <div className="small-label">Full Name</div>
                <div className="row-value">John Doe</div>
              </div>
              <span className="material-symbols-outlined">chevron_right</span>
            </button>

            <div className="divider" />

            <button className="list-row d-flex align-items-center justify-content-between w-100 p-3 text-start">
              <div>
                <div className="small-label">Email Address</div>
                <div className="row-value">john.doe@email.com</div>
              </div>
              <span className="material-symbols-outlined">chevron_right</span>
            </button>

            <div className="divider" />

            <button className="list-row d-flex align-items-center justify-content-between w-100 p-3 text-start">
              <div>
                <div className="small-label">Password</div>
                <div className="row-value">••••••••••••</div>
              </div>
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </section>

        {/* Payment Methods */}
        <section>
          <h3 className="section-heading">Payment Methods</h3>

          <div className="card settings-card">
            <button className="list-row d-flex align-items-center justify-content-between w-100 p-3 text-start">
              <div className="d-flex align-items-center gap-3">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_MCw5S-N-0BsMuDiULItt2wyMk_z26TEWNONsyQirRZ0aBOg31v5RsRK-J3J7m9uegN0KDZJ4n7wK_eGcZVc2wrSFNDpTx5L-XtO115xRjgcg-LJS_kDGH26KRkkWhW_6Dc7bFHb3LaKeVGFF-bjj2Je3b6aoxG3XEpcjjArJZcuxiCkwYmRhrPEyYlrqFBLlxK0L6h4zhyP7yoE4mvloL8rW8NQdTcP-1ghX1JDntbVghEsig3d2y_NFFwiIDJ0DrHUpsCyvq9c"
                  alt="Visa logo"
                  className="visa-logo"
                />
                <div>
                  <div className="row-value">Visa ending in 4242</div>
                  <div className="small-label">Expires 12/25</div>
                </div>
              </div>
              <span className="material-symbols-outlined">chevron_right</span>
            </button>

            <div className="divider" />

            <button className="list-row add-payment d-flex align-items-center w-100 p-3 text-primary fw-semibold">
              <span className="material-symbols-outlined me-2">add_circle</span>
              <span>Add Payment Method</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
