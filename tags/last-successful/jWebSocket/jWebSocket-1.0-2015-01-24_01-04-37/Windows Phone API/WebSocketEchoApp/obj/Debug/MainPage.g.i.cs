﻿#pragma checksum "J:\Development\Java\jWebSocket\branches\jWebSocket-1.0\Windows Phone API\WebSocketEchoApp\MainPage.xaml" "{406ea660-64cf-4c82-b6f0-42d48172a799}" "84A0DE885573691D88C7DFA58FC37177"
//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Runtime Version:4.0.30319.239
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

using Microsoft.Phone.Controls;
using System;
using System.Windows;
using System.Windows.Automation;
using System.Windows.Automation.Peers;
using System.Windows.Automation.Provider;
using System.Windows.Controls;
using System.Windows.Controls.Primitives;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Ink;
using System.Windows.Input;
using System.Windows.Interop;
using System.Windows.Markup;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Media.Imaging;
using System.Windows.Resources;
using System.Windows.Shapes;
using System.Windows.Threading;


namespace WebSocketEchoApp {
    
    
    public partial class MainPage : Microsoft.Phone.Controls.PhoneApplicationPage {
        
        internal System.Windows.Controls.Grid LayoutRoot;
        
        internal System.Windows.Controls.StackPanel TitlePanel;
        
        internal System.Windows.Controls.Grid ContentPanel;
        
        internal System.Windows.Controls.TextBox UrlBox;
        
        internal System.Windows.Controls.Button ConnectBtn;
        
        internal System.Windows.Controls.Button PingBtn;
        
        internal System.Windows.Controls.ListBox StatusList;
        
        internal System.Windows.Controls.TextBox EchoMessage;
        
        internal System.Windows.Controls.Button Echo;
        
        internal System.Windows.Controls.TextBox EchoMessageResult;
        
        internal System.Windows.Controls.Button DisconnectBtn;
        
        private bool _contentLoaded;
        
        /// <summary>
        /// InitializeComponent
        /// </summary>
        [System.Diagnostics.DebuggerNonUserCodeAttribute()]
        public void InitializeComponent() {
            if (_contentLoaded) {
                return;
            }
            _contentLoaded = true;
            System.Windows.Application.LoadComponent(this, new System.Uri("/WebSocketEchoApp;component/MainPage.xaml", System.UriKind.Relative));
            this.LayoutRoot = ((System.Windows.Controls.Grid)(this.FindName("LayoutRoot")));
            this.TitlePanel = ((System.Windows.Controls.StackPanel)(this.FindName("TitlePanel")));
            this.ContentPanel = ((System.Windows.Controls.Grid)(this.FindName("ContentPanel")));
            this.UrlBox = ((System.Windows.Controls.TextBox)(this.FindName("UrlBox")));
            this.ConnectBtn = ((System.Windows.Controls.Button)(this.FindName("ConnectBtn")));
            this.PingBtn = ((System.Windows.Controls.Button)(this.FindName("PingBtn")));
            this.StatusList = ((System.Windows.Controls.ListBox)(this.FindName("StatusList")));
            this.EchoMessage = ((System.Windows.Controls.TextBox)(this.FindName("EchoMessage")));
            this.Echo = ((System.Windows.Controls.Button)(this.FindName("Echo")));
            this.EchoMessageResult = ((System.Windows.Controls.TextBox)(this.FindName("EchoMessageResult")));
            this.DisconnectBtn = ((System.Windows.Controls.Button)(this.FindName("DisconnectBtn")));
        }
    }
}

