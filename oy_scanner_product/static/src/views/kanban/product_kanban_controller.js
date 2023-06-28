/** @odoo-module **/

import Dialog from 'web.Dialog';
import core from 'web.core';
import { KanbanController } from "@web/views/kanban/kanban_controller";
import Domain from "web.Domain";

export class ProductKanbanController extends KanbanController {
    async onScan(){
        const $content = $(core.qweb.render('oy_scanner_product.ProductScanner'));
        this.scannerDialog = new Dialog(this, {
            title: 'Product Scanner',
            $content,
            buttons: [],
            onForceClose: () => this._stopStream
            
        });

        await this.scannerDialog.open();
        await this._openScanner();
       
        $('#sourceSelect').on('change', () => {
            this.codeReader.reset();
            const sourceSelect = $('#sourceSelect')[0];
            if (sourceSelect){
                this.selectedDeviceId = sourceSelect.value;
            }

            this._openScanner();
        });
    }
    async _openScanner () {
        this.scanning = true;
        this.codeReader = new ZXing.BrowserMultiFormatReader();
        this.videoInputDevices = await this.codeReader.listVideoInputDevices();
        
        $('#sourceSelect').empty()

        if (this.videoInputDevices.length >= 1) {
            const sourceSelect = $('#sourceSelect')[0];

            this.videoInputDevices.reverse().forEach((element) => {
                const sourceOption = document.createElement('option');
                sourceOption.text = element.label;
                sourceOption.value = element.deviceId;
                
                if (!this.selectedDeviceId) {
                    this.selectedDeviceId = element.deviceId;
                } else {
                    if(this.selectedDeviceId == element.deviceId)
                        sourceOption.selected = 'selected';    
                }

                sourceSelect.appendChild(sourceOption);
            });
        }
        

        this.codeReader.decodeFromVideoDevice(this.selectedDeviceId, 'barcode_scanner', (result, err) => {
            if(this.scanning){
                if (result) {
                    this.scanning = false;
                    this.createNewFilters(result.text)
                    this._stopStream();
                    this.scannerDialog.destroy();
                    this.codeReader.stop();
                }
            }
        }).catch((err) => {
            console.log(err);
        });
    }
    _stopStream() {
        const videoElem = $('#barcode_scanner')[0];
        const stream = videoElem.srcObject;
        if(stream){
            const tracks = stream.getTracks();
            tracks.forEach((track) => {
                track.stop();
            });
        }
        
        videoElem.srcObject = null;
        
    }
    
    async createNewFilters(parm){
        if(this.lastFilter){
            this.env.searchModel.deactivateGroup(this.lastFilter.groupId);
            delete this.env.searchModel.searchItems[this.lastFilter.id];
        }
    
        const preFilter = [{
            description: "Barcode is equal to "+ parm,
            domain: Domain.prototype.arrayToString([['barcode', '=', parm]]),
            type: 'filter',
        }];
      
        this.env.searchModel.createNewFilters(preFilter);
        this.lastFilter = preFilter[0];
    }
}