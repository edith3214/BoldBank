import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";
import "../Error.css";

export default function Error() {
  return (
    <div className="error-root d-flex min-vh-100 bg-background-light dark-mode-bg">
      <div className="container-fluid p-0">
        <div className="px-4 px-sm-10 px-md-20 px-lg-40 d-flex flex-column min-vh-100">
          {/* Header */}
          <header className="d-flex align-items-center justify-content-between border-bottom py-3 px-4 px-sm-10">
            <div className="d-flex align-items-center gap-3 text-gray-200">
              <div className="logo-box" aria-hidden>
                <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="32" height="32">
                  <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fillRule="evenodd" />
                  <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fillRule="evenodd" />
                </svg>
              </div>
              <h2 className="h5 mb-0">TRUSTBANK</h2>
            </div>
          </header>

          {/* Main */}
          <main className="flex-grow-1 d-flex align-items-center justify-content-center">
            <div className="text-center py-5 py-sm-6">
              <img
                className="img-fluid error-illustration mb-4"
                alt="Friendly robot error illustration"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDx_KGuxGyGiYEQHhqfY4FJKLoVHQfPh3qTpMHhcr-ByZlCdP4iZFxkv-ymgTfqzots3E6V1Urn7pEFMW8Ff1uDuaC4jCCPzGI0kkgJwBPrXEIXMkyIvePDYcXdi6WBfMyoQ6PRtlKuXliuHCrlFQVil_4Xv3d2bXRuwuoiifkiQ8Glvl6-WcCLy6INwMDaq9Wr6r4Z0xaEjtjg7_2HRtmjXIdCXzua0VsTmrJ6Up8Sie7vM31aeEBRaxNfJlT3pEncdUCFdy4B0d8"
              />

              <div className="mx-auto" style={{ maxWidth: 480 }}>
                <p className="display-title mb-2">Houston, we have a small problem.</p>
                <p className="lead text-muted mb-3">
                  It seems we've hit a temporary snag on this page. No need to worry, your accounts and data are safe. Let's get you back on track.
                </p>

                <div className="d-grid gap-2 col-12 mx-auto" style={{ maxWidth: 480 }}>
                  <button className="btn btn-primary btn-lg"><><Link to="/dashboard" style={{ color: "#fff" }}>Return to Dashboard</Link></></button>
                </div>

                <p className="error-code mt-4 text-muted">Error Code: 404-V2</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
