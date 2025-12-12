package com.clone.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressUpdateRequest {
    private String zipCode;
    private String address;
    private String detailAddress;
}
