@extends('layouts.app')

@section('title', 'تفاصيل المنتج - TRIXA')

@section('content')
    <header class="topbar">
      <div class="topbar__left">
        <a href="{{ route('home') }}" class="icon-btn" aria-label="رجوع"><span class="i i-close" style="transform:rotate(45deg)"></span></a>
      </div>
      <div class="topbar__center">
        <img src="{{ asset('assets/logo.svg') }}" alt="TRIXA" class="logo" onerror="this.style.display='none'" />
        <span class="brand">TRIXA</span>
      </div>
      <div class="topbar__right">
        <a href="https://instagram.com/trrixa.store" target="_blank" rel="noopener" aria-label="Instagram" class="icon-btn">
          <span class="icon icon-ig" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="18" height="18" rx="5" ry="5" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/>
              <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/>
            </svg>
          </span>
        </a>
        <a id="btnCart" href="{{ route('cart') }}" aria-label="السلة" class="icon-btn"><span class="i i-cart"></span><span class="badge" id="cartCount">0</span></a>
      </div>
    </header>

    <main class="product">
      <section class="bar" style="margin-bottom:8px">
        <div class="bar__item">
          <select id="currency" class="select">
            <option value="SAR">SAR - ﷼</option>
            <option value="USD">USD - $</option>
            <option value="ILS">ILS - ₪</option>
          </select>
          <span id="flag" class="flag-emoji" aria-label="علم">🇸🇦</span>
        </div>
      </section>

      <section class="p-hero">
        <div id="pMedia" class="p-media" aria-label="صورة المنتج"></div>
        <div class="p-info">
          <h1 id="pTitle" class="p-title"></h1>
          <div class="p-meta">
            <span id="pInstant" class="chip" hidden>تفعيل فوري</span>
          </div>
          <div class="p-price">
            <span id="pOld" class="old" hidden></span>
            <span id="pNew" class="new"></span>
          </div>
          <p id="pDesc" class="p-desc"></p>
          <div class="p-actions">
            <button id="pAdd" class="btn btn-primary" style="width:100%">أضف إلى السلة</button>
          </div>
        </div>
      </section>
    </main>
@endsection

@push('scripts')
<script src="{{ asset('js/app.js') }}"></script>
<script src="{{ asset('js/product.js') }}"></script>
@endpush

