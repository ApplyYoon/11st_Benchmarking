/**
 * 주소 업데이트 요청 DTO
 * - PUT /api/users/me/address 요청 시 사용
 * - zipCode, address, detailAddress 필드 포함
 */
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
